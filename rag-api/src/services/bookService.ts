import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Book } from '../types/book.js';

const booksFile = fileURLToPath(new URL('../db/books.json', import.meta.url));

async function readBooks(): Promise<Book[]> {
  const raw = await readFile(booksFile, 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('Inventory data must be an array');
  return parsed as Book[];
}

export async function getAvailableBooks(): Promise<Book[]> {
  return (await readBooks()).filter((book) => book.stock > 0);
}

export async function getBooksByIds(ids: string[]): Promise<Book[]> {
  const requested = new Set(ids);
  return (await readBooks()).filter((book) => requested.has(book.id));
}
