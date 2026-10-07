import { Router, type Request, type Response, type NextFunction } from 'express';
import { askGemini } from '../services/geminiService.js';
import { getBooksByIds } from '../services/bookService.js';
import type { ChatHistoryItem, ChatRequestBody } from '../types/chat.js';

const router = Router();

function isHistory(value: unknown): value is ChatHistoryItem[] {
  return Array.isArray(value) && value.every((item) => (
    item && typeof item === 'object'
    && (item as ChatHistoryItem).role !== undefined
    && ['user', 'model'].includes((item as ChatHistoryItem).role)
    && Array.isArray((item as ChatHistoryItem).parts)
    && (item as ChatHistoryItem).parts.every((part) => part && typeof part.text === 'string' && part.text.length <= 10_000)
  ));
}

router.post('/', async (req: Request<unknown, unknown, ChatRequestBody>, res: Response, next: NextFunction) => {
  try {
    const { message, history = [] } = req.body || {};
    if (typeof message !== 'string' || message.trim().length === 0 || message.length > 2_000) {
      res.status(400).json({ success: false, error: 'message must be a non-empty string of at most 2000 characters' });
      return;
    }
    if (!isHistory(history) || history.length > 20) {
      res.status(400).json({ success: false, error: 'history must contain at most 20 valid user/model messages' });
      return;
    }
    const result = await askGemini(message.trim(), history);
    const suggestedBooks = await getBooksByIds(result.suggested_book_ids);
    res.status(200).json({ success: true, data: { message: result.message, suggested_books: suggestedBooks } });
  } catch (error) {
    next(error);
  }
});

export default router;
