import type { Book } from '../types/book.js';

const bookstoreBooksUrl = process.env.BOOKSTORE_BOOKS_URL || 'http://localhost:8080/api/books';
type BackendBook = {
  id: number;
  title: string;
  author: string;
  price: number;
  stock: number;
  active?: boolean;
  description?: string;
  imageUrl?: string;
  categories?: Array<{ name?: string }>;
  category?: { name?: string } | null;
};

function isBackendBook(value: unknown): value is BackendBook {
  if (!value || typeof value !== 'object') return false;
  const book = value as Partial<BackendBook>;
  return Number.isInteger(book.id)
    && typeof book.title === 'string'
    && typeof book.author === 'string'
    && Number.isFinite(Number(book.price))
    && Number.isInteger(Number(book.stock));
}

function resolveCoverUrl(value: string | undefined): string {
  if (!value) return '';
  try {
    return new URL(value, bookstoreBooksUrl).toString();
  } catch {
    return '';
  }
}

async function readBooks(): Promise<Book[]> {
  const response = await fetch(bookstoreBooksUrl, { signal: AbortSignal.timeout(5_000) });
  if (!response.ok) throw new Error(`Book catalog request failed with status ${response.status}`);
  const parsed = await response.json() as unknown;
  if (!Array.isArray(parsed)) throw new Error('Book catalog must be an array');

  return (parsed as unknown[]).filter(isBackendBook).filter((book) => book.active !== false).map((book) => {
    const categories = [...new Set([
      ...(book.categories || []).map((category) => category.name).filter((name): name is string => Boolean(name)),
      ...(book.category?.name ? [book.category.name] : []),
    ])];
    return {
      id: `BOOK_${book.id}`,
      title: book.title,
      author: book.author,
      price: Number(book.price),
      stock: Number(book.stock),
      cover_image: resolveCoverUrl(book.imageUrl),
      categories,
      summary: book.description?.slice(0, 1_500) || 'Chưa có mô tả cho cuốn sách này.',
      tags: categories,
    } satisfies Book;
  });
}

export async function getAvailableBooks(): Promise<Book[]> {
  return (await readBooks()).filter((book) => book.stock > 0);
}

export async function getBooksByIds(ids: string[]): Promise<Book[]> {
  const requested = new Set(ids);
  return (await getAvailableBooks()).filter((book) => requested.has(book.id));
}
