# Book Store

## Overview

Book Store is a full-stack web application for browsing, selling, and managing books. It includes a customer storefront and an admin workspace backed by a REST API.

## Features

- Browse, search, sort, and filter books by category and price.
- View book details, reviews, wishlist items, cart contents, and order history.
- Customer checkout with order tracking and Vietnamese address selection.
- Admin management for books, categories, authors, publishers, orders, users, and vouchers.
- Book availability controls with stop-selling status and transaction-aware deletion.
- JWT-based authentication and role-based access control.
- Database versioning with Flyway and API documentation with Swagger UI.

## Tech Stack

[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.4-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-437291?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Vitest](https://img.shields.io/badge/Vitest-Tests-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

## Project Structure

~~~text
.
├── backend/     Spring Boot REST API, security, services, persistence, and Flyway migrations
├── frontend/    React and TypeScript storefront and admin interface
├── docs/        API and project documentation
├── docker-compose.yml
└── .env.example
~~~

### Local development

Requirements: Docker Desktop, Java 21, Maven, and Node.js.

~~~bash
docker compose up --build
~~~

Services:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- PostgreSQL: localhost:5432

For separate development, set a private `JWT_SECRET` (at least 32 bytes) in the
environment before starting the backend. Never use the placeholder in `.env.example`.
Then start PostgreSQL with `docker compose up -d postgres`, run `mvn spring-boot:run`
in `backend/`, and `npm install && npm run dev` in `frontend/`.

### Validation

~~~bash
cd backend && mvn test
cd frontend && npm test && npm run build
~~~

Order lists are paginated, checkout supports COD only until payment integration
is added, and the database migration invalidates existing JWT sessions.




