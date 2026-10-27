import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronRight, RotateCcw, Send, X } from 'lucide-react';

type ChatRole = 'user' | 'model';
type ChatMessage = { id: string; role: ChatRole; text: string };
type SuggestedBook = { id: string; title: string; author: string; price: number; stock: number; cover_image?: string };

const RAG_API_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:3000';
const initialMessage: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text: 'Chào bạn! Mình là trợ lý sách của Book Store. Bạn đang muốn tìm sách theo chủ đề, tác giả hay ngân sách nào?',
};
const suggestions = ['Sách xây dựng thói quen tốt', 'Gợi ý sách cho trẻ em', 'Sách lập trình hay'];

function toHistory(messages: ChatMessage[]) {
  return messages.filter((message) => message.id !== 'welcome').map((message) => ({
    role: message.role,
    parts: [{ text: message.text }],
  }));
}

export const BookAdvisorChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [suggestedBooks, setSuggestedBooks] = useState<SuggestedBook[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  const sendMessage = async (value = input) => {
    const text = value.trim();
    if (!text || isLoading) return;
    const userMessage: ChatMessage = { id: `${Date.now()}-user`, role: 'user', text };
    setMessages((current) => [...current, userMessage]);
    setSuggestedBooks([]);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${RAG_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: toHistory(messages) }),
      });
      const payload = await response.json() as { data?: { message: string; suggested_books: SuggestedBook[] }; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error || 'Trợ lý đang tạm thời bận.');
      setMessages((current) => [...current, { id: `${Date.now()}-model`, role: 'model', text: payload.data!.message }]);
      setSuggestedBooks(payload.data.suggested_books || []);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Không thể kết nối với trợ lý sách.';
      setError(message.includes('fetch') ? 'Chưa kết nối được trợ lý sách. Hãy thử lại sau ít phút.' : message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([initialMessage]);
    setSuggestedBooks([]);
    setError('');
    setInput('');
  };

  return (
    <div className="book-advisor">
      {isOpen && (
        <section className="book-advisor-panel" aria-label="Trợ lý tư vấn sách">
          <header className="book-advisor-header">
            <div className="book-advisor-identity">
              <span className="book-advisor-avatar"><img src="/book-advisor-avatar.png" alt="" /></span>
              <div>
                <strong>Trợ lý sách</strong>
                <span><i /> Đang sẵn sàng tư vấn</span>
              </div>
            </div>
            <div className="book-advisor-actions">
              <button type="button" onClick={resetChat} aria-label="Bắt đầu lại cuộc trò chuyện" title="Bắt đầu lại"><RotateCcw size={16} /></button>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Đóng trợ lý"><X size={19} /></button>
            </div>
          </header>

          <div className="book-advisor-body">
            <div className="book-advisor-messages" aria-live="polite">
              {messages.map((message) => (
                <div key={message.id} className={`book-advisor-message ${message.role}`}>
                  {message.role === 'model' && <span className="book-advisor-mini-avatar"><img src="/book-advisor-avatar.png" alt="" /></span>}
                  <p>{message.text}</p>
                </div>
              ))}
              {isLoading && (
                <div className="book-advisor-message model">
                  <span className="book-advisor-mini-avatar"><img src="/book-advisor-avatar.png" alt="" /></span>
                  <p className="book-advisor-typing"><span /><span /><span /></p>
                </div>
              )}
              {suggestedBooks.length > 0 && (
                <div className="book-advisor-recommendations">
                  <div className="book-advisor-recommendation-title"><BookOpen size={15} /> Sách phù hợp với bạn</div>
                  {suggestedBooks.map((book) => (
                    <a key={book.id} className="book-advisor-book" href={`/books?search=${encodeURIComponent(book.title)}`}>
                      <div className="book-advisor-book-cover">
                        {book.cover_image ? <img src={book.cover_image} alt="" /> : <BookOpen size={18} />}
                      </div>
                      <div className="book-advisor-book-info">
                        <strong>{book.title}</strong>
                        <span>{book.author}</span>
                        <b>{book.price.toLocaleString('vi-VN')} ₫</b>
                      </div>
                      <ChevronRight size={16} />
                    </a>
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>

            {messages.length === 1 && !isLoading && (
              <div className="book-advisor-suggestions">
                {suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)}>{suggestion}</button>)}
              </div>
            )}
            {error && <div className="book-advisor-error" role="alert">{error}</div>}
          </div>

          <form className="book-advisor-composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Bạn muốn tìm sách gì?" aria-label="Tin nhắn cho trợ lý sách" maxLength={2000} disabled={isLoading} />
            <button type="submit" aria-label="Gửi tin nhắn" disabled={!input.trim() || isLoading}><Send size={17} /></button>
          </form>
          <div className="book-advisor-note">Trợ lý dựa trên danh mục sách đang còn hàng.</div>
        </section>
      )}

      <button type="button" className={`book-advisor-launcher${isOpen ? ' is-open' : ''}`} onClick={() => setIsOpen((current) => !current)} aria-label={isOpen ? 'Đóng trợ lý sách' : 'Mở trợ lý sách'}>
        {isOpen ? <X size={23} /> : <img src="/book-advisor-avatar.png" alt="" />}
        {!isOpen && <span className="book-advisor-launcher-label">Tư vấn sách</span>}
      </button>
    </div>
  );
};
