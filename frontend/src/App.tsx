import { FormEvent, useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { api, Book, Category } from './api'

function Layout({ children }: { children: React.ReactNode }) {
  return <><header><div className="brand">Book Store</div><nav><Link to="/">Sách</Link><Link to="/categories">Danh mục</Link></nav></header><main>{children}</main></>
}

function Books() {
  const [books, setBooks] = useState<Book[]>([]); const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({ title: '', author: '', price: '', stock: '', categoryId: '' })
  const load = () => api.get<Book[]>('/books').then(r => setBooks(r.data))
  useEffect(() => { load(); api.get<Category[]>('/categories').then(r => setCategories(r.data)) }, [])
  const submit = async (e: FormEvent) => { e.preventDefault(); await api.post('/books', { ...form, price: Number(form.price), stock: Number(form.stock), categoryId: form.categoryId ? Number(form.categoryId) : null }); setForm({ title: '', author: '', price: '', stock: '', categoryId: '' }); load() }
  const remove = async (id: number) => { await api.delete(`/books/${id}`); load() }
  return <><div className="page-title"><div><p className="eyebrow">QUẢN LÝ KHO</p><h1>Danh sách sách</h1></div><span className="count">{books.length} sản phẩm</span></div><section className="panel"><h2>Thêm sách mới</h2><form onSubmit={submit} className="form-grid"><input placeholder="Tên sách" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/><input placeholder="Tác giả" required value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}/><input placeholder="Giá (VNĐ)" required type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}/><input placeholder="Tồn kho" required type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}/><select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}><option value="">Chọn danh mục</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><button>Thêm sách</button></form></section><section className="panel"><table><thead><tr><th>Tên sách</th><th>Tác giả</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th></th></tr></thead><tbody>{books.map(b => <tr key={b.id}><td><strong>{b.title}</strong></td><td>{b.author}</td><td>{b.category?.name || '—'}</td><td>{Number(b.price).toLocaleString('vi-VN')} ₫</td><td><span className={b.stock < 5 ? 'low' : 'stock'}>{b.stock}</span></td><td><button className="danger" onClick={() => remove(b.id)}>Xóa</button></td></tr>)}{!books.length && <tr><td colSpan={6} className="empty">Chưa có sách nào.</td></tr>}</tbody></table></section></>
}

function Categories() {
  const [items, setItems] = useState<Category[]>([]); const [name, setName] = useState('')
  const load = () => api.get<Category[]>('/categories').then(r => setItems(r.data)); useEffect(() => { load() }, [])
  const submit = async (e: FormEvent) => { e.preventDefault(); await api.post('/categories', { name }); setName(''); load() }
  return <><div className="page-title"><div><p className="eyebrow">DANH MỤC</p><h1>Phân loại sách</h1></div></div><section className="panel narrow"><form className="inline-form" onSubmit={submit}><input placeholder="Tên danh mục mới" required value={name} onChange={e => setName(e.target.value)}/><button>Thêm</button></form><ul className="categories">{items.map(c => <li key={c.id}>{c.name}</li>)}</ul></section></>
}

export default function App() { return <Layout><Routes><Route path="/" element={<Books/>}/><Route path="/categories" element={<Categories/>}/></Routes></Layout> }
