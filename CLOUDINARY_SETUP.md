# Cloudinary Setup Instructions

## ⚠️ IMPORTANT: Current Status
Your application is currently using **placeholder values** for Cloudinary configuration. You need to replace these with your actual Cloudinary credentials for image uploads to work.

## 1. Create a Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com) and sign up for a free account
2. After verification, you'll be taken to your dashboard

## 2. Get Your Configuration Values
From your Cloudinary dashboard, copy the following values:

### Cloud Name
- Found in the "Product Environment Credentials" section
- It's usually displayed as "Cloud name: your_cloud_name"

### Upload Preset (For unsigned uploads)
1. Go to Settings (gear icon) → Upload
2. Scroll down to "Upload presets"
3. Click "Add upload preset"
4. Set the following:
   - **Preset name**: `employee_profiles` (or any name you prefer)
   - **Signing mode**: `Unsigned`
   - **Folder**: `employee-profiles` (optional, for organization)
   - **Allowed formats**: `jpg,png,gif,webp`
   - **Max file size**: `5000000` (5MB)
   - **Transformation**: Add if needed (e.g., resize to 400x400)
5. Save the preset

### API Key and Secret (For server-side operations)
- Found in the "Product Environment Credentials" section
- **API Key**: Long number starting with your cloud name
- **API Secret**: Long alphanumeric string (keep this secret!)

## 3. Update Environment Variables
Edit your `.env.local` file with your actual values:

```env
# Replace these with your actual Cloudinary values
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=employee_profiles
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

## 4. Restart Your Development Server
After updating the environment variables, restart your Next.js development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

## 5. Test the Upload
1. Go to your employee form
2. Try uploading a profile picture
3. Check the browser console for any error messages
4. Verify the image appears in your Cloudinary Media Library

## Troubleshooting

### Common Issues:

1. **"Upload failed: 401 Unauthorized"**
   - Check that your upload preset exists and is set to "Unsigned"
   - Verify the cloud name is correct

2. **"Upload failed: 400 Bad Request"**
   - Check file size (must be under 5MB)
   - Verify file format is supported (jpg, png, gif, webp)

3. **"Cloudinary configuration missing"**
   - Ensure environment variables are set correctly
   - Restart your development server after changing .env.local

4. **CORS errors**
   - This shouldn't happen with Cloudinary, but if it does, check your upload preset settings

### Debug Steps:
1. Check browser developer tools → Network tab for failed requests
2. Look at the Console tab for error messages
3. Verify environment variables are loaded: `console.log(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)`

## Security Notes
- Never expose your API secret in client-side code
- Use upload presets for client-side uploads (they're designed for this)
- Consider adding additional validation/restrictions in your upload preset
- For production, you might want to implement server-side upload endpoints for additional security
