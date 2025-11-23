export const environment = {
  production: false,
  apiUrl: "http://localhost:3000", // Your local backend API URL
  googleClientId: "YOUR_GOOGLE_CLIENT_ID", // Replace with your Google OAuth Client ID
  // SECURITY NOTE: OpenAI API key should ONLY be in backend .env file
  // All AI operations are handled server-side for security
};
