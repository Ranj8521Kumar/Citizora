# CivicConnect Server

This is the backend server for the CivicConnect platform. It provides RESTful APIs for user, employee, and admin management, authentication, reporting, notifications, and blockchain integrations for data security and transparency.

## Features
- User, employee, and admin registration and authentication
- JWT-based authentication and role-based access control
- Password reset and email notifications
- MongoDB for data storage
- Cloudinary integration for file uploads
- Mapbox integration for geospatial features
- Blockchain integration:
  - **Hyperledger Fabric** for private, auditable storage of sensitive user/employee data hashes
  - **Ethereum** for transparent reward transactions

## Directory Structure
```
server/
  src/
    server.js                # Entry point
    api/
      controllers/           # Route controllers (auth, admin, fieldworker, etc.)
      middleware/            # Custom middleware (auth, error handling)
      models/                # Mongoose models
      routes/                # API route definitions
      services/              # Service logic (uploads, blockchain, etc.)
      utils/                 # Utility functions (email, blockchain, etc.)
    tests/                   # Integration and unit tests
  docs/                      # API and testing documentation
  scripts/                   # Utility scripts (e.g., admin creation)
  .env                       # Environment variables
  package.json               # Project dependencies and scripts
```

## Environment Variables
See `.env` for all configuration options. Key variables:
- `PORT`, `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `CLOUDINARY_*`
- `SMTP_*`, `EMAIL_FROM`
- `MAPBOX_API_KEY`
- `ADMIN_CREATION_TOKEN`
- `FABRIC_CONNECTION_PROFILE`, `FABRIC_WALLET_PATH`, `FABRIC_USER_ID`
- `ETH_RPC_URL`, `ETH_PRIVATE_KEY`, `REWARD_CONTRACT_ADDRESS`

## Getting Started
1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up your `.env` file (see `.env.example` or `.env`).
3. Start the server:
   ```sh
   npm start
   ```

## Blockchain Integration
- **Hyperledger Fabric**: Used for private, auditable storage of user/employee data hashes. Only authorized parties can access this data.
- **Ethereum**: Used for transparent reward transactions. All reward events are publicly verifiable.

## Testing
- Postman collections are available in the `server/` directory for API testing.
- Run tests:
  ```sh
  npm test
  ```

## Documentation
- API documentation: `docs/admin-api.md`
- Postman testing guide: `docs/postman-testing-guide.md`

## License
MIT License
