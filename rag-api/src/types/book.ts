export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  cover_image: string;
  categories: string[];
  summary: string;
  tags: string[];
}
