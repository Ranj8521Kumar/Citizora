# CivicConnect Users Frontend

A React-based frontend for the CivicConnect platform, allowing citizens to report community issues and track their resolution.

## Features

- **User Authentication**: Secure login and registration system
- **Report Submission**: Multi-step form for submitting community issues with image uploads
- **Dashboard**: Personal dashboard to track submitted reports
- **Community View**: Browse all community reports
- **Real-time Updates**: Status updates and notifications

## Backend Connection

This frontend connects to the CivicConnect backend API deployed at:
```
https://civic-connect-backend-aq2a.onrender.com/api
```

## Quick Start

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

## API Integration

The frontend uses a centralized API service (`src/services/api.js`) that handles:
- Authentication (login/register)
- Report management (create, read, update)
- Image uploads
- User profile management

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Technology Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Lucide React** - Icons

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/            # Reusable UI components
│   ├── AuthModal.jsx  # Authentication modal
│   ├── Dashboard.jsx  # User dashboard
│   ├── ReportForm.jsx # Report submission form
│   └── ...
├── services/
│   └── api.js         # API service layer
└── App.jsx            # Main application component
```
