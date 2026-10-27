import 'dotenv/config';
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import chatRoute from './routes/chatRoute.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.RAG_ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const rateWindows = new Map<string, { expiresAt: number; count: number }>();
const CHAT_LIMIT = 30;
const CHAT_WINDOW_MS = 60_000;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '256kb' }));
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/chat', (req, res, next) => {
  const now = Date.now();
  for (const [key, window] of rateWindows) {
    if (window.expiresAt <= now) rateWindows.delete(key);
  }
  const key = req.socket.remoteAddress || 'unknown';
  const current = rateWindows.get(key);
  if (!current || current.expiresAt <= now) {
    if (rateWindows.size >= 10_000) {
      res.status(429).json({ success: false, error: 'Too many requests' });
      return;
    }
    rateWindows.set(key, { expiresAt: now + CHAT_WINDOW_MS, count: 1 });
  } else if (current.count >= CHAT_LIMIT) {
    res.setHeader('Retry-After', '60');
    res.status(429).json({ success: false, error: 'Too many requests' });
    return;
  } else {
    current.count += 1;
  }
  next();
});
app.use('/api/chat', chatRoute);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error('[rag-api]', error);
  const message = error instanceof Error ? error.message : 'Internal server error';
  const status = message.includes('GEMINI_API_KEY') ? 503 : message.includes('timed out') ? 504 : 502;
  const publicMessage = status === 504
    ? 'AI advisor request timed out'
    : 'AI advisor is temporarily unavailable';
  res.status(status).json({ success: false, error: publicMessage });
};
app.use(errorHandler);

app.listen(port, () => console.log(`BookStore RAG API listening on http://localhost:${port}`));
