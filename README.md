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

[![React](https://img.shields.io/badge/React?logo=react&logoColor=white&color=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript?logo=typescript&logoColor=white&color=3178C6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite?logo=vite&logoColor=white&color=646CFF)](https://vite.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.4?logo=springboot&logoColor=white&color=6DB33F)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21?logo=openjdk&logoColor=white&color=437291)](https://www.oracle.com/java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL?logo=postgresql&logoColor=white&color=4169E1)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose?logo=docker&logoColor=white&color=2496ED)](https://docs.docker.com/compose/)
[![Vitest](https://img.shields.io/badge/Vitest-Tests?logo=vitest&logoColor=white&color=6E9F18)](https://vitest.dev/)

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

For separate development, start PostgreSQL with docker compose up -d postgres, then run mvn spring-boot:run in backend/ and npm install && npm run dev in frontend/.

### Validation

~~~bash
cd backend && mvn test
cd frontend && npm test && npm run build
~~~



