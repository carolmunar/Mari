import { serve } from '@hono/node-server';
import './loadEnv.js';
import { app } from './app.js';

const port = Number(process.env.PORT) || 3001;
console.log(`API server listening on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
