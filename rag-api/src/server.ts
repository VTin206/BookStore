import 'dotenv/config';
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import chatRoute from './routes/chatRoute.js';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: '256kb' }));
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/chat', chatRoute);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error('[rag-api]', error);
  const message = error instanceof Error ? error.message : 'Internal server error';
  const status = message.includes('GEMINI_API_KEY') ? 503 : message.includes('timed out') ? 504 : 502;
  res.status(status).json({ success: false, error: status === 502 ? 'AI advisor is temporarily unavailable' : message });
};
app.use(errorHandler);

app.listen(port, () => console.log(`BookStore RAG API listening on http://localhost:${port}`));
