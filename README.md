# CivicConnect

CivicConnect is a comprehensive civic issue reporting and management platform that connects citizens, field employees, and administrators to efficiently address community issues.

## Project Structure

The project is organized into four main components:

1. **Server**: Node.js/Express backend API
2. **Admin**: React-based admin panel for administrators
3. **Users**: React-based web app for citizens to report issues
4. **Employees**: React-based web app for field employees to manage assigned tasks

## Features

### Server API
- User authentication and authorization
- Report submission and management
- Real-time notifications via WebSockets
- File uploads to Cloudinary
- Email notifications
- Geospatial queries for location-based reports

### Admin Panel
- Dashboard with analytics
- User management
- Report management
- Employee assignment
- Map view of all reports

### User App
- User registration and authentication
- Report submission with location and images
- Track report status
- Provide feedback on resolved issues

### Employee App
- View assigned reports
- Update report status
- Add progress notes
- Mark reports as resolved
- Field task management

## Technology Stack

- **Backend**: Node.js, Express, MongoDB, Socket.IO
- **Frontend**: React, Material-UI
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Maps**: Mapbox
- **Real-time Communication**: Socket.IO

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary Account (for file storage)
- Mapbox API Key

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/civic-connect.git
cd civic-connect
```

2. Install server dependencies
```
cd server
npm install
```

3. Install admin panel dependencies
```
cd ../admin
npm install
```

4. Install user app dependencies
```
cd ../users
npm install
```

5. Install employee app dependencies
```
cd ../employees
npm install
```

### Configuration

1. Create a `.env` file in the server directory with the following variables:
```
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

2. Create `.env` files in each frontend directory (admin, users, employees) with:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_MAPBOX_API_KEY=your_mapbox_api_key
```

### Running the Application

1. Start the server
```
cd server
npm run dev
```

2. Start the admin panel
```
cd admin
npm start
```

3. Start the user app
```
cd users
npm start
```

4. Start the employee app
```
cd employees
npm start
```

## API Documentation

The API documentation is available at `/api-docs` when running the server.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
