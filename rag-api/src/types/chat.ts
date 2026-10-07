export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface ChatResult {
  message: string;
  suggested_book_ids: string[];
}

export interface ChatRequestBody {
  message: string;
  history?: ChatHistoryItem[];
}
