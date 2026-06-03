import { Hono } from 'hono';
import { cors } from 'hono/cors';
import './loadEnv.ts';
import { getAiConfig } from './loadEnv.ts';
import { runContextAgent } from './agents/context.ts';
import { runAnalyzeAgent } from './agents/analyze.ts';
import { runAssignAgent } from './agents/assign.ts';
import { runSprintAgent } from './agents/sprint.ts';
import { contextInputSchema } from '../shared/schemas/index.ts';

function getAllowedOrigins(): string[] {
  const origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  return origins;
}

export const app = new Hono();

app.use(
  '/*',
  cors({
    origin: getAllowedOrigins(),
  }),
);

app.get('/api/health', (c) => {
  try {
    const { provider } = getAiConfig();
    return c.json({ ok: true, apiKeyConfigured: true, provider });
  } catch {
    return c.json({ ok: true, apiKeyConfigured: false });
  }
});

app.post('/api/agents/context', async (c) => {
  try {
    const body = contextInputSchema.parse(await c.req.json());
    const result = await runContextAgent(body);
    return c.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Context agent failed';
    return c.json({ error: message }, 500);
  }
});

app.post('/api/agents/analyze', async (c) => {
  try {
    const body = await c.req.json();
    const result = await runAnalyzeAgent(body);
    return c.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis agent failed';
    return c.json({ error: message }, 500);
  }
});

app.post('/api/agents/assign', async (c) => {
  try {
    const body = await c.req.json();
    const result = await runAssignAgent(body.tasks, body.team);
    return c.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Assignment agent failed';
    return c.json({ error: message }, 500);
  }
});

app.post('/api/agents/sprint', async (c) => {
  try {
    const body = await c.req.json();
    const result = await runSprintAgent(body);
    return c.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sprint agent failed';
    return c.json({ error: message }, 500);
  }
});
