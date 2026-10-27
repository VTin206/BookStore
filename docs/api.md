# API E-commerce

Swagger UI: `http://localhost:8080/swagger-ui.html`

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- Send JWT as `Authorization: Bearer <token>` for protected endpoints.

- `GET/POST /api/categories`
- `GET/POST/PUT/DELETE /api/books`
- `GET /api/users`
- `GET/POST /api/orders` (order lists return a paginated `Page`)
- `POST /api/orders/quote` (re-checks current prices, stock, shipping and voucher)
- `GET/DELETE /api/cart`
- `GET /api/reviews/book/{bookId}` (public)
- `POST /api/reviews` (requires login)

Roles are `CUSTOMER` and `ADMIN`; new registrations are `CUSTOMER` by default.

Checkout pricing is calculated by the backend. Shipping is free for item totals
from 250,000 VND; otherwise it is 30,000 VND. The quote endpoint and order
creation use the same calculation. COD is supported end to end. BANK orders
can be created as pending manual bank-transfer orders, but there is no provider
webhook, automatic payment verification, or refund flow yet; do not treat a
BANK order as paid until an administrator verifies it outside this API.

JWT signing requires `JWT_SECRET` to be a private value of at least 32 bytes.
Password or role changes invalidate existing sessions. Pending anonymous orders
expire automatically after the configured TTL.

Tạo đơn hàng nhận `customerName`, `customerEmail` và `items` gồm `bookId`, `quantity`; tồn kho được giảm trong cùng transaction.
