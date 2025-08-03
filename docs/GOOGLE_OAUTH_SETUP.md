# Google OAuth Configuration Guide for MiniCoder

## Overview

This guide provides step-by-step instructions for configuring Google OAuth authentication in the MiniCoder application.

## Prerequisites

- Google Cloud Console account
- MiniCoder application running locally
- Admin access to backend configuration

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "New Project" or select an existing project
3. Name your project (e.g., "MiniCoder Auth")
4. Note the Project ID

### 1.2 Enable Required APIs

1. Navigate to "APIs & Services" > "Library"
2. Search for and enable:
   - **Google+ API** (for basic profile information)
   - **Google Identity and Access Management (IAM) API**

### 1.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure the consent screen first if prompted:
   - User Type: External (for public app) or Internal (for organization)
   - App name: "MiniCoder"
   - User support email: Your email
   - App logo: Upload MiniCoder logo (optional)
   - Authorized domains: Add your domains (localhost, your-domain.com)
4. Create OAuth Client ID:
   - Application type: "Web application"
   - Name: "MiniCoder Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:4200` (development)
     - `https://your-domain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:4200/auth/google/callback` (development)
     - `https://your-domain.com/auth/google/callback` (production)

### 1.4 Save Credentials

- Copy the **Client ID** and **Client Secret**
- Keep these secure and never commit them to version control

## Step 2: Backend Configuration

### 2.1 Install Required Dependencies

```bash
cd backend
npm install google-auth-library
```

### 2.2 Environment Variables

Add to your `backend/.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 2.3 Update Auth Controller

Replace the placeholder Google OAuth methods in `backend/src/controllers/authController.ts`:

```typescript
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const googleAuth = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const authUrl = googleClient.generateAuthUrl({
      access_type: "offline",
      scope: ["profile", "email"],
      prompt: "consent",
    });

    res.redirect(authUrl);
  }
);

export const googleCallback = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { token } = req.body;

    try {
      // Verify the Google token
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(400).json({ error: "Invalid Google token" });
      }

      const { sub: googleId, email, name, picture } = payload;

      // Check if user exists
      let user = await authService.findUserByEmail(email!);

      if (!user) {
        // Create new user from Google profile
        const username = await authService.generateUniqueUsername(
          name || email!.split("@")[0]
        );
        user = await authService.register({
          username,
          email: email!,
          name: name!,
          password: null, // No password for OAuth users
          googleId,
          profilePicture: picture,
        });
      } else {
        // Update existing user with Google ID if not set
        if (!user.googleId) {
          user = await authService.updateUser(user.id, { googleId });
        }
      }

      // Generate JWT token
      const jwtToken = await authService.generateToken(user);

      res.json({
        token: jwtToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      return res.status(400).json({ error: "Google authentication failed" });
    }
  }
);
```

### 2.4 Update Database Schema

Add Google OAuth fields to your user model in `backend/prisma/schema.prisma`:

```prisma
model User {
  id              Int      @id @default(autoincrement())
  username        String   @unique
  email           String?  @unique
  name            String?
  password        String?  // Nullable for OAuth users
  googleId        String?  @unique // Google OAuth ID
  profilePicture  String?  // Google profile picture URL
  tokens          Int      @default(100)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Existing fields...
  Project Project[]

  @@map("users")
}
```

Run migration:

```bash
cd backend
npx prisma migrate dev --name add-google-oauth
npx prisma generate
```

## Step 3: Frontend Configuration

### 3.1 Environment Variables

Add to `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
  googleClientId: "your-google-client-id.googleusercontent.com",
};
```

### 3.2 Install Google Identity Services

Add to `src/index.html`:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### 3.3 Update Auth Service

Replace the placeholder Google OAuth method in `src/app/services/auth.service.ts`:

```typescript
declare global {
  interface Window {
    google: any;
  }
}

googleSignIn(): Observable<GoogleAuthResponse> {
  return new Observable(observer => {
    if (!window.google) {
      observer.error('Google Identity Services not loaded');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => {
        // Send the token to your backend
        this.handleGoogleAuthCallback(response.credential).subscribe({
          next: (authResponse) => observer.next(authResponse),
          error: (error) => observer.error(error)
        });
      }
    });

    window.google.accounts.id.prompt();
  });
}
```

### 3.4 Update Auth Modal Component

Replace the placeholder method in `src/app/shared/auth-modal.component.ts`:

```typescript
onGoogleSignIn(): void {
  this.isLoading = true;
  this.error = "";

  this.authService.googleSignIn().subscribe({
    next: (response) => {
      this.isLoading = false;
      this.authSuccess.emit(response.user);
      this.onClose();
    },
    error: (error) => {
      this.isLoading = false;
      this.error = error.message || "Google sign-in failed. Please try again.";
    }
  });
}
```

## Step 4: Testing

### 4.1 Development Testing

1. Start your backend: `cd backend && npm run dev`
2. Start your frontend: `cd .. && npm start`
3. Navigate to `http://localhost:4200`
4. Try any action that requires authentication
5. Click "Sign up with Google" or "Sign in with Google"

### 4.2 Test Scenarios

- [ ] New user registration via Google
- [ ] Existing user login via Google
- [ ] Error handling for invalid tokens
- [ ] Fallback to username/password registration
- [ ] User profile creation and storage
- [ ] Token refresh and persistence

## Step 5: Production Deployment

### 5.1 Update Environment Variables

- Set production Google Client ID and Secret
- Update redirect URIs to production domains
- Configure HTTPS endpoints

### 5.2 Security Considerations

- Use HTTPS in production
- Implement CSRF protection
- Validate all tokens server-side
- Use secure cookie settings
- Implement rate limiting

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch"**: Check authorized redirect URIs in Google Console
2. **"invalid_client"**: Verify Client ID and Secret are correct
3. **CORS errors**: Ensure authorized origins are configured
4. **Token validation fails**: Check server time synchronization

### Debug Tools

- Google OAuth Playground: https://developers.google.com/oauthplayground/
- JWT Debugger: https://jwt.io/
- Browser Developer Tools Network tab

## Security Best Practices

1. Never expose Client Secret in frontend code
2. Always validate tokens server-side
3. Implement proper session management
4. Use secure cookie settings in production
5. Monitor for suspicious authentication patterns
6. Implement account linking safeguards
7. Provide clear privacy policy for OAuth data usage

## Additional Resources

- [Google Identity Documentation](https://developers.google.com/identity)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Google Sign-In JavaScript Client Reference](https://developers.google.com/identity/gsi/web/reference/js-reference)
