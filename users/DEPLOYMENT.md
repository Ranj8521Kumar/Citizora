# CivicConnect Users Frontend - Deployment Guide

## Overview
This is the users frontend for CivicConnect, a civic engagement platform that allows citizens to report issues in their community.

## Backend Connection
The frontend is configured to connect to the backend API at:
```
https://civic-connect-backend-aq2a.onrender.com/api
```

## Features
- User authentication (login/register)
- Report submission with image uploads
- Dashboard for viewing user's reports
- Community view for browsing all reports
- Real-time status updates

## Deployment Options

### Option 1: Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. The `vercel.json` file is already configured
3. Deploy automatically on push to main branch

### Option 2: Netlify
1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

### Option 3: Manual Deployment
1. Build the project:
   ```bash
   npm run build
   ```
2. Upload the `dist` folder to your web server

## Environment Variables
No environment variables are required as the API URL is hardcoded in the service.

## API Endpoints Used
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get specific report
- `PATCH /api/reports/:id/status` - Update report status
- `POST /api/reports/:id/feedback` - Add feedback to report
- `POST /api/reports/:id/images` - Upload images for report
- `GET /api/users/me` - Get current user profile

## Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting
1. If the backend is not responding, check the API URL in `src/services/api.js`
2. Ensure CORS is properly configured on the backend
3. Check browser console for any API errors
4. Verify that the backend is running and accessible

## Security Notes
- JWT tokens are stored in localStorage
- Images are converted to base64 for upload (consider using a CDN in production)
- All API calls include proper authentication headers
