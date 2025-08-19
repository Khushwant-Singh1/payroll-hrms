# Deployment Guide

## Environment Variables for Production

When deploying to Vercel, make sure to set these environment variables in your Vercel dashboard:

### Required Environment Variables:

1. **DATABASE_URL**: Your PostgreSQL connection string
2. **AUTH_SECRET**: A secure random string for JWT signing
3. **NEXTAUTH_URL**: Your production domain (e.g., `https://your-app.vercel.app`)
4. **CLOUDINARY_API_KEY**: Your Cloudinary API key
5. **CLOUDINARY_API_SECRET**: Your Cloudinary API secret
6. **NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME**: Your Cloudinary cloud name
7. **NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET**: Your Cloudinary upload preset

### Setting Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with the appropriate values

### Important Notes:

- **NEXTAUTH_URL** should be set to your actual production domain (e.g., `https://payroll-dashboard.vercel.app`)
- **AUTH_SECRET** should be a long, random string. You can generate one using: `openssl rand -base64 32`
- Vercel automatically provides **VERCEL_URL** which our app will use as a fallback

### Auto-Detection:

The app will automatically detect the production environment and use the correct URLs. The auth configuration has been updated to:

1. Use `NEXTAUTH_URL` if set
2. Fall back to `VERCEL_URL` (automatically provided by Vercel)
3. Use localhost for development

### Testing:

After deployment, test the sign-in flow to ensure redirects work correctly with your production domain.
