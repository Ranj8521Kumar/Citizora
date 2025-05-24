/**
 * Server Integration Test
 * Tests to verify the server starts correctly with all routes
 */

const request = require('supertest');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

// Mock mongoose connection
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  Schema: jest.fn(),
  model: jest.fn()
}));

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn()
    }
  }
}));

describe('Server Integration', () => {
  let app;

  beforeAll(() => {
    // Import the app after mocking dependencies
    app = require('../src/server');
  });

  describe('Health Check', () => {
    test('should respond to health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('ok');
      expect(response.body.message).toBe('Server is running');
    });
  });

  describe('Route Registration', () => {
    test('should have auth routes registered', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .expect(400); // Expect 400 because no credentials provided
    });

    test('should have field worker routes registered', async () => {
      const response = await request(app)
        .get('/api/fieldworker/images')
        .expect(401); // Expect 401 because no auth token provided
    });

    test('should have report routes registered', async () => {
      const response = await request(app)
        .get('/api/reports')
        .expect(401); // Expect 401 because no auth token provided
    });

    test('should have user routes registered', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401); // Expect 401 because no auth token provided
    });

    test('should have admin routes registered', async () => {
      const response = await request(app)
        .get('/api/admin/admins')
        .expect(401); // Expect 401 because no auth token provided
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);
    });
  });
});

describe('Field Worker Routes Availability', () => {
  test('field worker routes should be accessible', () => {
    const fieldWorkerRoutes = require('../src/api/routes/fieldworker.routes');
    expect(fieldWorkerRoutes).toBeDefined();
  });

  test('field worker controller should be accessible', () => {
    const fieldWorkerController = require('../src/api/controllers/fieldworker.controller');
    expect(fieldWorkerController).toBeDefined();
  });

  test('upload service should have field worker functions', () => {
    const uploadService = require('../src/api/services/upload.service');
    expect(uploadService.uploadFieldWorkerImages).toBeDefined();
  });
});
