const MAX_DOC_CHARS = 48_000;
const FETCH_TIMEOUT_MS = 25_000;

export type DocFetchResult = {
  text: string;
  status: 'ok' | 'partial' | 'failed' | 'skipped';
  message: string;
  source: string;
};

function truncate(text: string): string {
  if (text.length <= MAX_DOC_CHARS) return text;
  return `${text.slice(0, MAX_DOC_CHARS)}\n\n[Content truncated for length…]`;
}

export function isNotionUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.includes('notion.so') || host.includes('notion.site');
  } catch {
    return false;
  }
}

/** Extract Notion page ID from share URL (32 hex chars, with or without dashes). */
export function parseNotionPageId(url: string): string | null {
  const uuidWithDashes =
    url.match(
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
    )?.[1] ?? null;
  if (uuidWithDashes) return uuidWithDashes.replace(/-/g, '');

  const compact32 = url.match(/([0-9a-f]{32})(?:\?|#|$|\/)/i)?.[1] ?? null;
  if (compact32) return compact32.toLowerCase();

  const lastSegment = url.split('/').pop()?.split('?')[0] ?? '';
  const fromTitle = lastSegment.match(/([0-9a-f]{32})$/i)?.[1];
  return fromTitle?.toLowerCase() ?? null;
}

function formatUuid(id: string): string {
  const c = id.replace(/-/g, '');
  if (c.length !== 32) return id;
  return `${c.slice(0, 8)}-${c.slice(8, 12)}-${c.slice(12, 16)}-${c.slice(16, 20)}-${c.slice(20)}`;
}

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Public/readable pages via Jina Reader (works for many shared Notion/Confluence pages). */
async function fetchViaJinaReader(url: string): Promise<DocFetchResult> {
  const readerUrl = `https://r.jina.ai/${url}`;
  const res = await fetchWithTimeout(readerUrl, {
    headers: { Accept: 'text/plain' },
  });

  if (!res.ok) {
    return {
      text: '',
      status: 'failed',
      message: `Could not read page (${res.status}). For private Notion pages, share to web or add NOTION_API_KEY in .env.`,
      source: 'jina-reader',
    };
  }

  const text = (await res.text()).trim();
  if (text.length < 80) {
    return {
      text: '',
      status: 'failed',
      message:
        'Page returned very little text. Share the Notion page to web (Share → Publish) or connect NOTION_API_KEY.',
      source: 'jina-reader',
    };
  }

  return {
    text: truncate(text),
    status: 'ok',
    message: `Fetched ${text.length} characters from the link.`,
    source: 'jina-reader',
  };
}

async function fetchNotionBlocksText(
  notion: import('@notionhq/client').Client,
  blockId: string,
  depth = 0,
): Promise<string> {
  if (depth > 8) return '';

  const lines: string[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: cursor,
    });

    for (const block of response.results) {
      if (!('type' in block)) continue;
      const type = block.type;
      const data = block as unknown as Record<
        string,
        { rich_text?: { plain_text: string }[] }
      >;

      const rich = data[type]?.rich_text;
      if (rich?.length) {
        const line = rich.map((t) => t.plain_text).join('');
        if (line.trim()) {
          if (type.startsWith('heading')) lines.push(`\n## ${line}\n`);
          else if (type === 'bulleted_list_item') lines.push(`- ${line}`);
          else if (type === 'numbered_list_item') lines.push(`1. ${line}`);
          else lines.push(line);
        }
      }

      if ('has_children' in block && block.has_children) {
        const child = await fetchNotionBlocksText(notion, block.id, depth + 1);
        if (child) lines.push(child);
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return lines.join('\n');
}

async function fetchViaNotionApi(url: string): Promise<DocFetchResult> {
  const token = process.env.NOTION_API_KEY?.trim();
  if (!token) {
    return {
      text: '',
      status: 'skipped',
      message: 'NOTION_API_KEY not set — trying public page reader instead.',
      source: 'notion-api',
    };
  }

  const pageIdRaw = parseNotionPageId(url);
  if (!pageIdRaw) {
    return {
      text: '',
      status: 'failed',
      message: 'Could not parse Notion page ID from this URL.',
      source: 'notion-api',
    };
  }

  const { Client } = await import('@notionhq/client');
  const notion = new Client({ auth: token });
  const pageId = formatUuid(pageIdRaw);

  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    let title = 'Notion page';
    if ('properties' in page) {
      for (const prop of Object.values(page.properties)) {
        if (
          prop &&
          typeof prop === 'object' &&
          'type' in prop &&
          prop.type === 'title' &&
          'title' in prop &&
          Array.isArray(prop.title)
        ) {
          title = prop.title.map((t) => t.plain_text).join('') || title;
          break;
        }
      }
    }

    const body = await fetchNotionBlocksText(notion, pageId);
    const text = truncate(`# ${title}\n\n${body}`.trim());

    if (text.length < 80) {
      return {
        text: '',
        status: 'partial',
        message:
          'Notion page found but little text was returned. Share the page with your Notion integration.',
        source: 'notion-api',
      };
    }

    return {
      text,
      status: 'ok',
      message: `Fetched Notion page "${title}" via API.`,
      source: 'notion-api',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Notion API error';
    return {
      text: '',
      status: 'failed',
      message: `${msg}. Ensure the integration has access to this page (⋯ → Connections → add your integration).`,
      source: 'notion-api',
    };
  }
}

/** Fetch documentation text from a URL (Notion, Confluence, Google Docs public links, etc.). */
export async function fetchDocumentation(
  url: string | undefined,
): Promise<DocFetchResult> {
  const trimmed = url?.trim();
  if (!trimmed) {
    return {
      text: '',
      status: 'skipped',
      message: 'No documentation URL provided.',
      source: 'none',
    };
  }

  try {
    new URL(trimmed);
  } catch {
    return {
      text: '',
      status: 'failed',
      message: 'Invalid URL format.',
      source: 'none',
    };
  }

  if (isNotionUrl(trimmed) && process.env.NOTION_API_KEY?.trim()) {
    const notionResult = await fetchViaNotionApi(trimmed);
    if (notionResult.text.length > 0) return notionResult;
  }

  return fetchViaJinaReader(trimmed);
}
