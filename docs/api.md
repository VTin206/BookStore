# API E-commerce

Swagger UI: `http://localhost:8080/swagger-ui.html`

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- Send JWT as `Authorization: Bearer <token>` for protected endpoints.

- `GET/POST /api/categories`
- `GET/POST/PUT/DELETE /api/books`
- `GET /api/users`
- `GET/POST /api/orders`
- `GET/DELETE /api/cart`
- `GET /api/reviews/book/{bookId}` (public)
- `POST /api/reviews` (requires login)

Roles are `CUSTOMER` and `ADMIN`; new registrations are `CUSTOMER` by default.

Checkout pricing is calculated by the backend. Shipping is free for item totals
from 250,000 VND; otherwise it is 30,000 VND. The `TRIAN30` coupon applies a
30% discount to the item subtotal.

Tạo đơn hàng nhận `customerName`, `customerEmail` và `items` gồm `bookId`, `quantity`; tồn kho được giảm trong cùng transaction.
