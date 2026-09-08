# Task API

A simple RESTful CRUD API for managing tasks, built with Express.js, PostgreSQL, Docker, and documented with Swagger/OpenAPI.

## What this is

A lightweight Task Management API that provides complete CRUD functionality for managing tasks.

This project uses a PostgreSQL database running inside Docker for persistent storage. The application and database can be started together using Docker Compose, providing a consistent development environment.

The project follows a simple layered architecture where route handlers delegate all database operations to a dedicated PostgreSQL repository, making it easier to change the storage implementation without modifying the API endpoints.

Interactive API documentation is available through Swagger UI at `/docs`.

---

## Features

- Full CRUD operations for task management
- PostgreSQL database for persistent storage
- Dockerized application and database
- One-command startup using Docker Compose
- Dedicated PostgreSQL repository for database operations
- SQL initialization script for automatic table creation
- Environment-based configuration using `.env`
- Interactive API documentation with Swagger UI
- RESTful API architecture
- Proper HTTP status codes
- Error handling for invalid task IDs

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- pg
- Docker
- Docker Compose
- Swagger UI
- OpenAPI

---

## Project Structure

```text
.
├── images/
│   └── docker-containers.png\
|   └── docker-volume.png\
|   └── swagger-screenshot.png\
|
├── sql/
│   └── init.sql
├── .env.example
├── .gitignore
├── app.js
├── database.js
├── repos/
│   └── taskRepository.js
├── docker-compose.yml
├── Dockerfile
├── openapi.json
├── package.json
└── README.md
```

---

## Installation & Running

Clone the repository and install dependencies:

```bash
npm install
```

Create a `.env` file from the provided example:

```bash
cp .env.example .env
```

Start the complete application stack:

```bash
docker compose up
```

This command starts both:

- PostgreSQL database
- Express.js application

The API will be available at:

```
http://localhost:3000
```

Swagger documentation:

```
http://localhost:3000/docs
```

---

## Environment Variables

Example `.env`:

```env
DATABASE_URL=postgres://postgres:password@db:5432/todo
PORT=3000
```

The `.env` file is excluded from version control using `.gitignore`.

A `.env.example` file is included for reference.

---

## Database

This project uses PostgreSQL running inside Docker.

The database schema is automatically initialized using:

```
sql/init.sql
```

### Tasks Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Unique task identifier (Primary Key) |
| `title` | TEXT | Task title |
| `done` | BOOLEAN | Task completion status |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| GET | `/tasks` | Retrieve all tasks |
| GET | `/tasks/:id` | Retrieve a task by ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

---

## Example Request

Retrieve all tasks:

```bash
curl http://localhost:3000/tasks
```

### Response

```json
[
  {
    "id": 1,
    "title": "Complete FlyRank internship assignments",
    "done": true
  },
  {
    "id": 2,
    "title": "Learn and revise backend development concepts",
    "done": false
  }
]
```

---

## Docker

The project includes:

- **Dockerfile** for containerizing the Express.js application.
- **docker-compose.yml** for running both the Express application and PostgreSQL together with a single command.

---

## Architecture

Database access is encapsulated in `taskRepository.js`.

The API routes remain focused on handling HTTP requests and responses, while all SQL queries are handled by the repository layer. This separation allows the storage implementation to be changed without affecting the route handlers.

---

## Persistence

Task data is stored in a persistent Docker volume.

Persistence was verified by:

1. Starting the application using `docker compose up`.
2. Creating tasks through the API.
3. Restarting the application and PostgreSQL container.
4. Confirming that the previously created tasks remained in the database.

---

## Docker

The application and PostgreSQL database are started together using Docker Compose.

![Running Docker Containers](./images/docker-containers.png)

## Persistence

Task data is stored in a persistent Docker volume.

![Docker Volume](./images/docker-volume.png)

## Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:3000/docs
```

![Swagger UI Screenshot](./images/swagger-screenshot.png)