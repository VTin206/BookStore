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

Roles are `CUSTOMER` and `ADMIN`; new registrations are `CUSTOMER` by default.

Tạo đơn hàng nhận `customerName`, `customerEmail` và `items` gồm `bookId`, `quantity`; tồn kho được giảm trong cùng transaction.
