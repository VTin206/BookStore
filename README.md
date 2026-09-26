# Book Store

Ứng dụng quản lý và bán sách gồm frontend React/Vite, backend Spring Boot và PostgreSQL.

## Chạy nhanh bằng Docker

Yêu cầu: Docker Desktop đang chạy.

```bash
docker compose up --build
```

Sau khi khởi động:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- PostgreSQL: localhost:5432

Flyway tự chạy các migration trong `backend/src/main/resources/db/migration` khi backend khởi động.

## Chạy từng phần khi phát triển

Khởi động database:

```bash
docker compose up -d postgres
```

Khởi động backend:

```bash
cd backend
mvn spring-boot:run
```

Khởi động frontend:

```bash
cd frontend
npm install
npm run dev
```

## Kiểm tra mã nguồn

Backend:

```bash
cd backend
mvn test
mvn clean package -DskipTests
```

Frontend:

```bash
cd frontend
npm run build
```

## Cấu hình môi trường

Sao chép `.env.example` thành `.env` rồi đổi các giá trị bí mật trước khi deploy production. `VITE_API_URL` phải trỏ tới URL API public, ví dụ `https://api.example.com/api`.

Không dùng các giá trị mặc định của database và JWT trong production.

## Phạm vi chưa tích hợp

Thanh toán online thật, webhook và đối soát giao dịch chưa được tích hợp vì cần lựa chọn nhà cung cấp cùng API credentials cụ thể. Hiện hệ thống chỉ lưu phương thức thanh toán và trạng thái giao dịch ở mức nghiệp vụ.