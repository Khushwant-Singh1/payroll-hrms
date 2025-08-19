# AuthJS Setup Guide

This guide explains the complete AuthJS setup for your Next.js payroll dashboard application.

## 🚀 Quick Start

1. **Environment Variables**: Copy `.env.example` to `.env.local` and configure your OAuth provider credentials.

2. **Session Provider**: Wrap your app in the SessionProvider (see `app/layout.tsx` example below).

3. **Test Authentication**: Visit `/auth/signin` to test the authentication flow.

## 📁 File Structure

```
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # Auth API routes
│   └── auth/
│       ├── signin/page.tsx              # Sign-in page
│       └── error/page.tsx               # Error page
├── components/auth/
│   ├── index.ts                         # Export all components
│   ├── session-provider.tsx             # Session provider wrapper
│   ├── sign-in-button.tsx              # OAuth sign-in buttons
│   ├── sign-out-button.tsx             # Sign-out button
│   ├── user-avatar.tsx                  # User avatar with dropdown
│   ├── credentials-form.tsx             # Email/password form
│   └── auth-guard.tsx                   # Route protection component
├── hooks/
│   └── use-auth.ts                      # Custom auth hooks
├── utils/
│   └── auth.ts                          # NextAuth configuration
├── middleware.ts                        # Route protection middleware
├── .env.local                           # Environment variables
└── .env.example                         # Environment template
```

## ⚙️ Configuration

### 1. OAuth Providers Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create credentials (OAuth 2.0 client ID)
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Add your client ID and secret to `.env.local`

#### GitHub OAuth
1. Go to [GitHub Settings > Developer Settings](https://github.com/settings/applications/new)
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
4. Add your client ID and secret to `.env.local`

### 2. Environment Variables

```bash
# Required
AUTH_SECRET="your-secret-here"          # Generate with: npx auth secret
NEXTAUTH_URL="http://localhost:3000"    # Your app URL

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Database (optional, for persistent sessions)
DATABASE_URL="your-database-url"
```

## 🧩 Components Usage

### SessionProvider (Required)
Wrap your app in the root layout:

```tsx
// app/layout.tsx
import { SessionProvider } from "@/components/auth"
import { auth } from "@/utils/auth"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

### Sign-in Components

```tsx
import { SignInButton, CredentialsForm } from "@/components/auth"

// OAuth buttons
<SignInButton provider="google" />
<SignInButton provider="github" />

// Credentials form
<CredentialsForm callbackUrl="/dashboard" />
```

### User Avatar & Sign-out

```tsx
import { UserAvatar, SignOutButton } from "@/components/auth"

// User avatar with dropdown menu
<UserAvatar />

// Simple sign-out button
<SignOutButton />
```

### Route Protection

```tsx
import { AuthGuard } from "@/components/auth"

// Protect entire page/component
<AuthGuard>
  <ProtectedContent />
</AuthGuard>
```

## 🪝 Hooks Usage

```tsx
import { useAuth, useRequireAuth, useRedirectIfAuthenticated } from "@/hooks/use-auth"

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  // Redirect to sign-in if not authenticated
  useRequireAuth()
  
  // Redirect to dashboard if already authenticated
  useRedirectIfAuthenticated()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please sign in</div>
  
  return <div>Hello, {user?.name}!</div>
}
```

## 🛡️ Route Protection

### Middleware Protection
The middleware automatically protects these routes:
- `/dashboard/*`
- `/profile/*`
- `/settings/*`
- `/admin/*`

### Server-side Protection
```tsx
// app/protected/page.tsx
import { auth } from "@/utils/auth"
import { redirect } from "next/navigation"

export default async function ProtectedPage() {
  const session = await auth()
  if (!session) {
    redirect("/auth/signin")
  }
  
  return <div>Protected content for {session.user?.name}</div>
}
```

### Client-side Protection
```tsx
"use client"
import { useRequireAuth } from "@/hooks/use-auth"

export default function ClientProtectedPage() {
  const { isAuthenticated, isLoading } = useRequireAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return null // Will redirect automatically
  
  return <div>Protected client content</div>
}
```

## 🔧 Customization

### Adding New Providers
1. Install the provider: `pnpm add @auth/[provider-name]`
2. Add to `utils/auth.ts`:
   ```tsx
   import NewProvider from "next-auth/providers/[provider-name]"
   
   providers: [
     NewProvider({
       clientId: process.env.NEW_PROVIDER_CLIENT_ID!,
       clientSecret: process.env.NEW_PROVIDER_CLIENT_SECRET!,
     }),
     // ... other providers
   ]
   ```

### Database Sessions (Optional)
If you want persistent sessions stored in a database:

1. Install Prisma adapter: `pnpm add @auth/prisma-adapter prisma @prisma/client`
2. Set up your database and Prisma schema
3. Uncomment the adapter lines in `utils/auth.ts`
4. Add `DATABASE_URL` to your environment variables

### Custom Sign-in Page
The default sign-in page is at `/auth/signin`. Customize it by editing `app/auth/signin/page.tsx`.

## 🧪 Testing

### Demo Credentials
For testing the credentials provider, use:
- **Email**: `demo@example.com`
- **Password**: `password`

### Development Testing
1. Start your development server: `pnpm dev`
2. Navigate to `/auth/signin`
3. Test different sign-in methods
4. Check that protected routes redirect to sign-in
5. Verify middleware protection works

## 📚 Additional Resources

- [AuthJS Documentation](https://authjs.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js v5 Migration Guide](https://authjs.dev/guides/upgrade-to-v5)

## 🐛 Troubleshooting

### Common Issues

1. **"Configuration" error**: Check your environment variables and OAuth app settings.

2. **"OAuthAccountNotLinked" error**: This account is already linked to another user. Try signing in with a different method first.

3. **Redirect URI mismatch**: Make sure your OAuth app's redirect URI exactly matches your callback URL.

4. **Session not persisting**: Ensure `AUTH_SECRET` is set and the same across deployments.

### Debug Mode
Set `NODE_ENV=development` and check the console for detailed auth logs.
