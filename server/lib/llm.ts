import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import type { z } from 'zod';
import { getAiConfig } from '../loadEnv.ts';

export function getModel() {
  const { provider, apiKey } = getAiConfig();

  if (provider === 'google') {
    const google = createGoogleGenerativeAI({ apiKey });
    return google('gemini-2.5-flash');
  }

  const openai = createOpenAI({ apiKey });
  return openai('gpt-4o-mini');
}

export async function runStructuredAgent<T extends z.ZodType>(
  system: string,
  userPayload: unknown,
  schema: T,
): Promise<z.infer<T>> {
  getAiConfig();

  const { object } = await generateObject({
    model: getModel(),
    schema,
    system,
    prompt: JSON.stringify(userPayload, null, 2),
  });

  return object;
}
