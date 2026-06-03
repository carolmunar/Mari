import { Hono } from 'hono';
import './loadEnv.js';
import { getAiConfig } from './loadEnv.js';
import { runContextAgent } from './agents/context.js';
import { runAnalyzeAgent } from './agents/analyze.js';
import { runAssignAgent } from './agents/assign.js';
import { runSprintAgent } from './agents/sprint.js';
import { contextInputSchema } from '../shared/schemas/index.js';

export const app = new Hono();

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
