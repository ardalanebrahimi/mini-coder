# Authentication Implementation Summary

## 🔐 Authentication Features Added

### JWT-Based Authentication System

- **Registration**: `POST /auth/register` - Create account with email/password
- **Login**: `POST /auth/login` - Authenticate and receive JWT token
- **Current User**: `GET /me` - Get authenticated user information
- **Middleware**: `authenticateJWT` - Protect routes with token validation

### Database Schema Updates

Updated User model with authentication fields:

```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String   // bcrypt hashed password
  name         String?
  tokens       Int      @default(100)  // User starts with 100 tokens
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  posts        Post[]
}
```

## 🚀 API Endpoints

### Authentication Routes

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe" // optional
}
```

**Response** (201 Created):

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "tokens": 100
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response** (200 OK):

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "tokens": 100
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User

```http
GET /me
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "tokens": 100,
  "createdAt": "2025-07-24T10:00:00.000Z",
  "updatedAt": "2025-07-24T10:00:00.000Z"
}
```

## 🔧 Implementation Details

### Password Security

- **bcrypt** hashing with salt rounds: 12
- Passwords are never stored in plain text
- Minimum password length: 6 characters

### JWT Configuration

- **Token Expiration**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Secret**: Configurable via `JWT_SECRET` environment variable
- **Payload**: Contains `userId` and `email`

### Token System

- New users start with **100 tokens**
- Tokens field ready for implementing usage-based features
- Can be updated via `AuthService.updateTokens()`

### Middleware Protection

```typescript
import { authenticateJWT } from "./middleware/auth";

// Protect routes
app.use("/api/v1/protected-route", authenticateJWT, routeHandler);
```

## 🛠️ Environment Variables

Add to your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

## 📝 Usage Examples

### Frontend Integration

```javascript
// Register
const registerResponse = await fetch("/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
    name: "John Doe",
  }),
});

const { user, token } = await registerResponse.json();

// Store token
localStorage.setItem("token", token);

// Use token for protected requests
const userResponse = await fetch("/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### Protecting Routes

```typescript
// Example: Protect user routes
app.use("/api/v1/users", authenticateJWT, userRoutes);

// In your controller, access authenticated user:
export const someProtectedAction = (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id; // Authenticated user ID
  const userTokens = req.user?.tokens; // User's token count
  // ... your logic
};
```

## 🧪 Testing

### Using curl:

```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (replace TOKEN with actual JWT)
curl -X GET http://localhost:3001/me \
  -H "Authorization: Bearer TOKEN"
```

### Using Swagger UI:

Visit `http://localhost:3001/api-docs` for interactive API testing.

## 🔒 Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Signed and time-limited
3. **Request Validation**: Email format and password strength
4. **Error Handling**: Secure error messages (no sensitive data leakage)
5. **CORS Protection**: Cross-origin request security
6. **Helmet Middleware**: Security headers

## 📊 Database Migration

After implementing authentication, run:

```bash
npx prisma generate  # Generate new client
npx prisma db push   # Apply schema changes
```

The authentication system is now ready for production use! 🎉

## 🪙 Token Deduction Middleware

### Token-Based Access Control

The system now includes middleware to enforce token-based access control:

- **Token Deduction**: Automatically deducts tokens from user accounts
- **Access Control**: Blocks requests when users run out of tokens
- **Flexible Configuration**: Configurable token costs per operation

### Token Middleware Usage

```typescript
import { requireTokens, checkTokens } from "./middleware/tokenDeduction";

// Deduct 1 token per request
app.use("/api/v1/prompts/generate", requireTokens(), generatePrompt);

// Deduct custom token amount
app.use(
  "/api/v1/expensive-operation",
  requireTokens({ tokensRequired: 5 }),
  handler
);

// Check tokens without deducting (for previews)
app.use("/api/v1/prompts/preview", checkTokens(1), previewPrompt);
```

### New API Endpoints

#### Token Management

- `GET /api/v1/tokens/balance` - Get current token balance
- `POST /api/v1/tokens/add` - Add tokens to account
- `GET /api/v1/tokens/usage` - Token usage statistics (coming soon)

#### Prompt Generation (Token-Protected)

- `POST /api/v1/prompts/preview` - Preview prompt cost (no deduction)
- `POST /api/v1/prompts/generate` - Generate prompt (costs 1 token)

### Example: Token-Protected Operation

```bash
# Check token balance
curl -X GET http://localhost:3001/api/v1/tokens/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Preview prompt cost (no tokens deducted)
curl -X POST http://localhost:3001/api/v1/prompts/preview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input":"Write a story about AI","type":"basic"}'

# Generate prompt (deducts 1 token)
curl -X POST http://localhost:3001/api/v1/prompts/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input":"Write a story about AI","type":"basic"}'
```

### Token Deduction Responses

**Success Response:**

```json
{
  "prompt": "Enhanced prompt: Write a story about AI...",
  "tokensUsed": 1,
  "tokensRemaining": 99,
  "metadata": {
    "inputLength": 20,
    "promptType": "basic",
    "timestamp": "2025-07-24T10:00:00.000Z"
  }
}
```

**Out of Tokens Response (403):**

```json
{
  "error": "Out of tokens",
  "tokensRequired": 1,
  "tokensAvailable": 0,
  "message": "You need 1 token(s) but only have 0"
}
```

### Response Headers

Token operations include helpful headers:

- `X-Tokens-Remaining`: Current token balance after operation
- `X-Tokens-Deducted`: Number of tokens deducted for this request
