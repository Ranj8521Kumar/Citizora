# CivicConnect

CivicConnect is a comprehensive civic issue reporting and management platform that connects citizens, field employees, and administrators to efficiently address community issues. The platform provides real-time communication, location-based reporting, and streamlined workflow management for municipal operations.

![System design and Architecture](System%20design%20and%20Architecture.png)

## Copyright Notice and Legal Warning

**© 2025 CivicConnect. All Rights Reserved.**

This project and all associated source code, documentation, designs, and assets are protected by copyright law and are the exclusive property of the copyright holder. 

**LEGAL WARNING:**
- Unauthorized copying, distribution, modification, public display, or public performance of this project, in whole or in part, is strictly prohibited.
- Use of this software without express written permission from the copyright holder is strictly prohibited.
- This project may contain patented technology and trade secrets.
- Unauthorized use may result in legal action, including but not limited to claims for damages and injunctive relief.

For licensing inquiries, please contact: legal@civicconnect.com

## Project Structure

The project is organized into four main components:

1. **Server**: Node.js/Express backend API with MongoDB
2. **Admin**: React-based admin panel for administrators with analytics dashboard
3. **Users**: React-based web app for citizens to report issues and track progress
4. **Employees**: React-based web app for field employees to manage assigned tasks

## Features

### Server API
- **Authentication & Authorization**: JWT-based user authentication with role-based access control
- **Report Management**: CRUD operations for civic issue reports with status tracking
- **Real-time Communication**: WebSocket integration for live updates and notifications
- **File Management**: Cloudinary integration for image uploads and storage
- **Email Notifications**: Automated email alerts for report updates and status changes
- **Geospatial Queries**: Location-based report filtering and mapping
- **User Management**: Admin, Field Worker, and Citizen role management
- **Analytics**: Report statistics and performance metrics

### Admin Panel
- **Dashboard**: Comprehensive analytics with charts and metrics
- **User Management**: View and manage all user accounts and roles
- **Report Management**: Oversee all reports with filtering and bulk operations
- **Employee Assignment**: Assign field workers to specific reports
- **Map Integration**: Visual map view of all reports with clustering
- **Real-time Updates**: Live dashboard updates via WebSocket
- **Export Functionality**: Data export capabilities for reporting

### User App (Citizens)
- **User Registration**: Secure account creation with email verification
- **Report Submission**: Multi-step form with location picker and image uploads
- **Status Tracking**: Real-time updates on report progress
- **Community View**: Browse and support other community reports
- **Feedback System**: Rate and comment on resolved issues
- **Mobile Responsive**: Optimized for mobile and desktop use

### Employee App (Field Workers)
- **Task Management**: View and manage assigned reports
- **Status Updates**: Update report progress with notes and photos
- **Field Operations**: Mobile-optimized interface for on-site work
- **Communication**: Direct messaging with administrators
- **Location Services**: GPS integration for accurate location reporting
- **Offline Support**: Basic functionality when offline

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO for WebSocket connections
- **File Storage**: Cloudinary for image and file management
- **Email**: Nodemailer for automated notifications
- **Maps**: Mapbox API for geospatial features
- **Validation**: Joi for request validation
- **Testing**: Jest for unit and integration tests

### Frontend
- **Framework**: React with Vite build tool
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom components
- **Icons**: Lucide React for consistent iconography
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context and hooks
- **Routing**: React Router for navigation
- **Real-time**: Socket.IO client for live updates
- **PWA Support**: Service workers for offline functionality
- **Geo-location**: Mapbox for location-based features

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with React-specific rules
- **Type Checking**: TypeScript support
- **Build Tool**: Vite for fast development and optimized builds
- **CSS Processing**: PostCSS with Autoprefixer
- **Version Control**: Git

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)
- MongoDB (v5 or higher)
- Cloudinary Account (for file storage)
- Mapbox API Key (for maps)
- SMTP Server (for email notifications)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ranj8521Kumar/CivicConnect.git
cd CivicConnect
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install admin panel dependencies**
```bash
cd ../admin
npm install
```

4. **Install user app dependencies**
```bash
cd ../users
npm install
```

5. **Install employee app dependencies**
```bash
cd ../employees
npm install
```

### Configuration

1. **Server Environment Variables** (create `server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/civic-connect
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
EMAIL_FROM=noreply@civicconnect.com
MAPBOX_API_KEY=your_mapbox_api_key
```

2. **Frontend Environment Variables** (create in each frontend directory: `admin/.env`, `users/.env`, `employees/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_MAPBOX_API_KEY=your_mapbox_api_key
```

### Running the Application

1. **Start the server**
```bash
cd server
npm run dev
```

2. **Start the admin panel** (in a new terminal)
```bash
cd admin
npm run dev
```

3. **Start the user app** (in a new terminal)
```bash
cd users
npm run dev
```

4. **Start the employee app** (in a new terminal)
```bash
cd employees
npm run dev
```

The applications will be available at:
- **Server API**: http://localhost:5000
- **Admin Panel**: http://localhost:5173
- **User App**: http://localhost:5174
- **Employee App**: http://localhost:5175

### Script Utilities

The server directory contains several useful scripts:

```bash
cd server
# Create admin user
node scripts/create-admin.js

# Create field worker account
node scripts/create-field-worker.js

# Generate test reports
node scripts/create-test-reports.js

# Check existing reports
node scripts/check-reports.js

# Generate test notifications
node scripts/create-test-notifications.js

# Test email configuration
node scripts/test-email.js
```

## API Documentation

The API documentation is available at `/api-docs` when running the server. The API includes:

- **Authentication Endpoints**: Login, register, refresh tokens
- **User Management**: CRUD operations for users
- **Report Endpoints**: Submit, update, and manage reports
- **File Upload**: Image upload to Cloudinary
- **Notifications**: Real-time notification system
- **Analytics**: Report statistics and metrics

## Development

### Project Structure
```
CivicConnect/
├── server/                 # Backend API
│   ├── src/
│   │   ├── api/           # API routes and controllers
│   │   ├── models/        # MongoDB schemas
│   │   ├── middleware/    # Custom middleware
│   │   └── utils/         # Utility functions
│   ├── tests/             # API tests
│   ├── scripts/           # Utility scripts
│   └── docs/              # API documentation
├── admin/                  # Admin panel
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Analytics/ # Analytics components
│   │   │   ├── Auth/      # Authentication components
│   │   │   ├── Dashboard/ # Dashboard components
│   │   │   ├── Layout/    # Layout components
│   │   │   └── Users/     # User management components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── users/                  # Citizen app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── employees/              # Field worker app
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── CameraInterface.jsx  # Camera functionality
│   │   │   ├── MapView.jsx          # Map integration
│   │   │   ├── OfflineIndicator.jsx # Offline support
│   │   │   ├── PhotoCapture.jsx     # Photo capture
│   │   │   ├── ReportDetail.jsx     # Report details
│   │   │   ├── StatusUpdate.jsx     # Status updates
│   │   │   └── TaskDashboard.jsx    # Task management
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── docs/                   # Project documentation
```

### Key Features Implemented

#### ✅ **Fixed Issues**
- Resolved all import dependency issues across all frontend applications
- Updated Tailwind CSS configuration with custom design system
- Fixed CSS variable definitions for consistent theming
- Standardized component imports without version numbers
- Installed all required dependencies for UI components

#### ✅ **UI/UX Improvements**
- Modern, responsive design with Tailwind CSS
- Consistent component library across all applications
- Dark mode support with CSS variables
- Mobile-first responsive design
- Accessible components with Radix UI primitives

#### ✅ **Development Experience**
- Fast development with Vite build tool
- Hot module replacement for instant updates
- TypeScript support for better development experience
- ESLint configuration for code quality
- Organized project structure

## Testing

The project includes comprehensive test suites:

```bash
# Run server unit and integration tests
cd server
npm test

# Run specific test suites
npm run test:integration
npm run test:unit

# Generate test coverage report
npm run test:coverage
```

Testing frameworks and tools:
- Jest for test runner and assertions
- Supertest for HTTP assertions
- MongoDB Memory Server for isolated database testing

## Deployment

Detailed deployment instructions are available in each application's directory in the `DEPLOYMENT.md` file.

### Production Build
Each frontend application can be built for production:
```bash
cd [admin|users|employees]
npm run build
```

The build output will be in the `dist` directory and can be served with any static file server.

### Deployment Options

1. **Vercel Deployment** (recommended for frontend apps)
   - Configure with vercel.json (already included)
   - Connect GitHub repository to Vercel
   - Set up environment variables

2. **Traditional Hosting**
   - Build the application
   - Upload dist directory to web server
   - Configure server for SPA routing

3. **Docker Deployment**
   - Docker configuration files are provided
   - Build and run containers for each component

4. **Server Deployment**
   - Deploy to Node.js hosting service (Heroku, DigitalOcean, etc.)
   - Set up MongoDB Atlas for database
   - Configure environment variables

For more details, see the `DEPLOYMENT.md` file in each application directory.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Documentation

Additional documentation is available in the project:

- **API Documentation**: Server API endpoints and usage (`server/docs/admin-api.md`)
- **Postman Collections**: Test collections for all API endpoints (`server/*.postman_collection.json`)
- **Testing Guide**: Guide for using Postman collections (`server/docs/postman-testing-guide.md`)
- **Technical Appendix**: Detailed technical information (`CivicConnect_Technical_Appendix.md`)
- **Research Paper**: Research behind the project (`CivicConnect_Research_Paper.md`)
- **Image Guide**: Visual design guidelines (`CivicConnect_Image_Guide.md`)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository or contact the development team at support@civicconnect.com.

## Project Status

Last updated: August 14, 2025

Current development focus:
- Enhancing offline capabilities in the employee app
- Improving analytics dashboard in the admin panel
- Adding real-time notification features
- Implementing accessibility improvements across all applications
