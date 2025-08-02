# SuperContext Web App

A modern React web application with comprehensive authentication using Better Auth.

## Features

- **Email/Password Authentication**: Complete sign-up and sign-in functionality
- **Role-Based Access Control**: Admin and user roles with protected routes
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Type Safety**: Full TypeScript support
- **Better Auth Integration**: Seamless authentication with Better Auth client

## Authentication Flow

### Public Routes
- `/` - Home page (shows different content based on auth status)
- `/sign-in` - Sign in page (redirects authenticated users to dashboard)
- `/sign-up` - Sign up page (redirects authenticated users to dashboard)

### Protected Routes
- `/dashboard` - User dashboard (requires authentication)
- `/admin` - Admin panel (requires admin role)

## Components

### Authentication Components
- `ProtectedRoute` - Wraps routes that require authentication
- `AdminRoute` - Wraps routes that require admin role
- `PublicRoute` - Wraps routes that should only be accessible to unauthenticated users

### UI Components
- `EmailSignInForm` - Sign in form with Better Auth integration
- `EmailSignUpForm` - Sign up form with Better Auth integration
- `Navigation` - Main navigation with user menu
- `Loading` - Loading spinner component

### Pages
- `HomePage` - Landing page with conditional content
- `DashboardPage` - User dashboard with account information
- `AdminPage` - Admin panel with management tools
- `SignInPage` - Sign in page
- `SignUpPage` - Sign up page

## Better Auth Hooks

The app uses Better Auth hooks for authentication:

- `useSession()` - Get current session and user data
- `useSignIn()` - Sign in functionality
- `useSignOut()` - Sign out functionality
- `useSignUp()` - Sign up functionality
- `useUpdateUser()` - Update user profile
- `useVerifyEmail()` - Email verification
- `useRequestPasswordReset()` - Request password reset
- `useResetPassword()` - Reset password

## User Roles

- **user** - Standard user with access to dashboard
- **admin** - Admin user with access to admin panel and all features

## Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## Environment Variables

Make sure to set up the following environment variables:

Create a `.env` file in the `apps/web` directory:

```env
# API Configuration
# This should point to your API server (default: http://localhost:3001)
BUN_PUBLIC_API_URL=http://localhost:3001
```

**Note**: 
- Bun uses the `BUN_PUBLIC_` prefix for environment variables that should be available in the browser
- The API server runs on port 3001 by default
- Make sure your API server is running before starting the web app

## API Integration

This frontend integrates with the SuperContext API which provides:

- User authentication endpoints
- Role-based access control
- Session management
- Email verification
- Password reset functionality

The API uses Better Auth with Drizzle ORM and PostgreSQL for data persistence.
