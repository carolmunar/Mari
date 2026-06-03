import {
  contextInputSchema,
  projectContextSchema,
  type ContextInput,
  type ProjectContext,
} from '../../shared/schemas';
import { fetchDocumentation } from '../lib/fetchDocumentation';
import { runStructuredAgent } from '../lib/llm';

const SYSTEM = `You are the Context Agent for an AI sprint planner.
Extract and normalize project information ONLY from the provided input.

CRITICAL RULES:
- When "fetchedDocumentContent" is present, base goals, constraints, and summary PRIMARILY on that text.
- Do NOT invent features, requirements, or goals that are not in fetchedDocumentContent, fileText, or additionalNotes.
- If fetchedDocumentContent is empty and docUrl was provided, say in summary that the link could not be read and use only other inputs.
- Preserve team availability flags exactly as given.
- projectName should reflect the real project in the documentation when available.`;

export async function runContextAgent(
  input: ContextInput,
): Promise<ProjectContext> {
  const parsed = contextInputSchema.parse(input);

  const sources: string[] = [];
  let fetchedDocumentContent = '';
  let docFetchStatus: ProjectContext['docFetchStatus'] = 'skipped';
  let docFetchMessage = 'No documentation URL provided.';

  if (parsed.docUrl) {
    const fetchResult = await fetchDocumentation(parsed.docUrl);
    docFetchStatus = fetchResult.status;
    docFetchMessage = fetchResult.message;
    fetchedDocumentContent = fetchResult.text;

    if (fetchResult.text) {
      sources.push(
        `Documentation from ${parsed.docUrl} (${fetchResult.source}):\n${fetchResult.text}`,
      );
    } else {
      sources.push(
        `Documentation URL (content not retrieved): ${parsed.docUrl}. Reason: ${fetchResult.message}`,
      );
    }
  }

  if (parsed.fileText) sources.push(`Uploaded file content:\n${parsed.fileText}`);
  if (parsed.additionalNotes)
    sources.push(`Additional notes:\n${parsed.additionalNotes}`);

  const payload = {
    docUrl: parsed.docUrl,
    fetchedDocumentContent,
    docFetchStatus,
    docFetchMessage,
    fileText: parsed.fileText,
    additionalNotes: parsed.additionalNotes,
    team: parsed.team,
    combinedSources: sources.join('\n\n---\n\n'),
  };

  const result = await runStructuredAgent(
    SYSTEM,
    payload,
    projectContextSchema,
  );

  return {
    ...result,
    teamSnapshot: parsed.team,
    rawSources: sources.length > 0 ? sources : ['No explicit sources provided'],
    docFetchStatus,
    docFetchMessage,
  };
}
