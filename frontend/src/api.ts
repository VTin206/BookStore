import axios from 'axios'
export const api = axios.create({ baseURL: 'http://localhost:8080/api' })
api.interceptors.request.use(config => { const token=localStorage.getItem('token'); if(token) config.headers.Authorization=`Bearer ${token}`; return config })
export type Category = { id: number; name: string }
export type Book = { id: number; title: string; author: string; price: number; stock: number; category?: Category }
