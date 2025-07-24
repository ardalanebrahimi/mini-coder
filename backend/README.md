# Mini Coder Backend

A complete Node.js + Express + TypeScript backend with PostgreSQL, Prisma ORM, JWT authentication, token-based billing, project management, and OpenAI integration.

## 🚀 Features

- **Authentication**: JWT-based user registration and login with bcrypt password hashing
- **Token System**: Token-based billing system with automatic deduction for API usage
- **Project Management**: Full CRUD operations for user projects with search functionality
- **AI Integration**: Secure OpenAI API proxy for code generation with token deduction
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **Security**: CORS, Helmet, input validation, and SQL injection prevention
- **Documentation**: Interactive Swagger/OpenAPI docs at `/api-docs`

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

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (protected)

### Token Management
- `GET /api/v1/tokens/balance` - Get user's token balance (protected)
- `POST /api/v1/tokens/add` - Add tokens to user account (protected)

### Projects
- `GET /api/v1/projects` - List user's projects (protected)
- `POST /api/v1/projects` - Create new project (protected)
- `GET /api/v1/projects/:id` - Get specific project (protected)
- `PUT /api/v1/projects/:id` - Update project (protected)
- `DELETE /api/v1/projects/:id` - Delete project (protected)
- `GET /api/v1/projects/search` - Search projects (protected)

### AI Code Generation
- `GET /ai/health` - Check AI service health (protected)
- `GET /ai/models` - List available AI models (protected)
- `POST /ai/generate` - Generate code using AI (protected, costs 1 token)

### Admin (Admin Only)
- `GET /admin` - Get admin dashboard statistics (admin only)

### Legacy Endpoints (Users & Posts)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
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
| `JWT_SECRET`   | JWT signing secret           | Required      |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Optional    |
| `ADMIN_EMAIL`  | Admin user email for admin access | Optional  |
| `API_VERSION`  | API version                  | `v1`          |

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT with bcrypt
- **AI Integration:** OpenAI API
- **Documentation:** Swagger/OpenAPI
- **Security:** Helmet, CORS, input validation
- **Development:** ts-node-dev

## Testing

Use the provided demo scripts to test different features:

```bash
# Test authentication system
demo-auth.bat

# Test project management
demo-projects.bat

# Test AI code generation
demo-ai.bat

# Test admin functionality
demo-admin.bat
```

**Note for Admin Testing:**
Set the `ADMIN_EMAIL` environment variable to match your admin user:
```bash
set ADMIN_EMAIL=admin@example.com  # Windows
export ADMIN_EMAIL=admin@example.com  # Linux/Mac
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
