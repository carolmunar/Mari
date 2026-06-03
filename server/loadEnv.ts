import { config } from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(serverDir, '..');
const envPath = path.join(projectRoot, '.env');

config({ path: envPath });

export type AiProvider = 'openai' | 'google';

function normalizeKey(raw: string | undefined): string {
  return raw?.trim() ?? '';
}

/** Fix common mistake: sk-proj-AQ.xxx pasted into OPENAI_API_KEY */
function unwrapMistakenPrefix(key: string): string {
  if (key.startsWith('sk-proj-AQ.')) return key.slice('sk-proj-'.length);
  if (key.startsWith('sk-AQ.')) return key.slice('sk-'.length);
  return key;
}

function detectProvider(key: string): AiProvider {
  if (key.startsWith('AQ.') || key.startsWith('AIza')) return 'google';
  if (key.startsWith('sk-')) return 'openai';
  throw new Error(
    'Unrecognized API key format. Use GEMINI_API_KEY=AQ.your-key from https://aistudio.google.com/apikey OR OPENAI_API_KEY=sk-... from https://platform.openai.com/api-keys',
  );
}

export function getAiConfig(): { provider: AiProvider; apiKey: string } {
  let geminiKey = normalizeKey(process.env.GEMINI_API_KEY);
  let openaiKey = normalizeKey(process.env.OPENAI_API_KEY);

  openaiKey = unwrapMistakenPrefix(openaiKey);

  if (!geminiKey && openaiKey.startsWith('AQ.')) {
    geminiKey = openaiKey;
    openaiKey = '';
  }

  if (geminiKey) {
    return { provider: 'google', apiKey: unwrapMistakenPrefix(geminiKey) };
  }

  if (openaiKey) {
    if (openaiKey.startsWith('sk-proj-Ab') || openaiKey.startsWith('sk-proj-AQ')) {
      throw new Error(
        'This looks like a Google Gemini key with sk-proj- added by mistake. In .env use: GEMINI_API_KEY=AQ.your-key (copy from https://aistudio.google.com/apikey — the key should start with AQ. only, no sk-proj-). Then restart npm run dev',
      );
    }
    return { provider: 'openai', apiKey: openaiKey };
  }

  if (!existsSync(envPath)) {
    throw new Error(
      'No .env file found. Add GEMINI_API_KEY=your-key from Google AI Studio (https://aistudio.google.com/apikey)',
    );
  }

  throw new Error(
    'No API key in .env. Add one line: GEMINI_API_KEY=AQ.your-key-from-google (from the Copy button in Google AI Studio). Do not add sk-proj- in front. Then restart: npm run dev',
  );
}

/** @deprecated use getAiConfig */
export function getOpenAIApiKey(): string {
  const { provider, apiKey } = getAiConfig();
  if (provider !== 'openai') {
    throw new Error(
      'You are using a Google Gemini key (AQ.). The app now uses GEMINI_API_KEY in .env — remove OPENAI_API_KEY or rename your line to GEMINI_API_KEY=AQ.your-key',
    );
  }
  return apiKey;
}
