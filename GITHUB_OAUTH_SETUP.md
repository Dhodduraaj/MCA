# GitHub OAuth Setup Instructions

## 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the following details:
   - **Application name**: Finance Tracker
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

## 2. Environment Variables

Add these environment variables to your `server/node/.env` file:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

## 3. Frontend Environment Variables

Create a `.env` file in the `client` directory:

```env
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id_here
```

## 4. How It Works

1. User clicks "Continue with GitHub" button
2. Opens GitHub OAuth popup window
3. User authorizes the application on GitHub
4. GitHub redirects to callback page with authorization code
5. Callback page sends code to parent window
6. Frontend sends code to backend
7. Backend exchanges code for access token
8. Backend fetches user data from GitHub API
9. Backend creates/updates user in database
10. Backend returns JWT token
11. User is logged in successfully

## 5. Features

- **Automatic User Creation**: New users are automatically created when they first log in with GitHub
- **Account Linking**: Existing users can link their GitHub account
- **Seamless Integration**: Works alongside Google OAuth and regular email/password login
- **Secure**: Uses GitHub's OAuth 2.0 flow with proper token exchange

## 6. Testing

1. Start the backend server: `cd server/node && npm start`
2. Start the frontend: `cd client && npm run dev`
3. Go to `http://localhost:3000/login`
4. Click "Continue with GitHub"
5. Complete the GitHub authorization
6. You should be logged in and redirected to the dashboard
