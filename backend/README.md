# Mini Coder Backend

A minimal Node.js + Express + TypeScript backend with PostgreSQL and Prisma ORM.

## Features

- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Robust relational database
- **Prisma ORM** - Modern database toolkit
- **Swagger/OpenAPI** - Interactive API documentation
- **Error Handling** - Centralized error management
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # Prisma client setup
│   │   └── swagger.ts   # Swagger configuration
│   ├── controllers/     # Request handlers
│   │   ├── userController.ts
│   │   └── postController.ts
│   ├── middleware/      # Custom middleware
│   │   └── errorHandler.ts
│   ├── models/          # TypeScript interfaces
│   │   ├── User.ts
│   │   └── Post.ts
│   ├── routes/          # Route definitions
│   │   ├── userRoutes.ts
│   │   └── postRoutes.ts
│   ├── services/        # Business logic
│   │   ├── userService.ts
│   │   └── postService.ts
│   └── index.ts         # Application entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── .env                 # Environment variables
├── .env.example         # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- npm or yarn

### Installation

1. **Navigate to the backend directory:**

   ```cmd
   cd backend
   ```

2. **Install dependencies:**

   ```cmd
   npm install
   ```

3. **Set up environment variables:**

   ```cmd
   copy .env.example .env
   ```

   Update the `.env` file with your PostgreSQL connection string:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/mini_coder_db?schema=public"
   ```

4. **Set up the database:**

   ```cmd
   npm run db:generate
   npm run db:push
   ```

5. **Start the development server:**
   ```cmd
   npm run dev
   ```

The server will start on `http://localhost:3001`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## API Documentation

Once the server is running, visit `http://localhost:3001/api-docs` to view the interactive Swagger documentation.

## API Endpoints

### Users

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Posts

- `GET /api/v1/posts` - Get all posts
- `GET /api/v1/posts/:id` - Get post by ID
- `POST /api/v1/posts` - Create new post
- `PUT /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Delete post

### Health Check

- `GET /health` - Application health status

## Database Schema

The application includes two main entities:

### User

- `id` - Auto-incrementing primary key
- `email` - Unique email address
- `name` - Optional display name
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Post

- `id` - Auto-incrementing primary key
- `title` - Post title
- `content` - Optional post content
- `published` - Publication status
- `authorId` - Optional reference to User
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Environment Variables

| Variable       | Description                  | Default       |
| -------------- | ---------------------------- | ------------- |
| `NODE_ENV`     | Environment mode             | `development` |
| `PORT`         | Server port                  | `3001`        |
| `DATABASE_URL` | PostgreSQL connection string | Required      |
| `JWT_SECRET`   | JWT signing secret           | Optional      |
| `API_VERSION`  | API version                  | `v1`          |

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Documentation:** Swagger/OpenAPI
- **Security:** Helmet, CORS
- **Development:** ts-node-dev

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
