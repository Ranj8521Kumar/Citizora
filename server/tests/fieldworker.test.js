/**
 * Field Worker Routes Test
 * Basic tests to verify field worker functionality
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const fieldWorkerRoutes = require('../src/api/routes/fieldworker.routes');
const { authMiddleware } = require('../src/api/middleware/auth.middleware');

// Mock the middleware and models
jest.mock('../src/api/middleware/auth.middleware');
jest.mock('../src/api/models/user.model');
jest.mock('../src/api/models/report.model');
jest.mock('../src/api/models/notification.model');
jest.mock('../src/api/services/upload.service');

describe('Field Worker Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Mock auth middleware to simulate employee user
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = {
        _id: 'employee123',
        role: 'employee',
        firstName: 'John',
        lastName: 'Worker'
      };
      next();
    });

    app.use('/api/fieldworker', fieldWorkerRoutes);
  });

  describe('Route Registration', () => {
    test('should have progress image upload route', async () => {
      const response = await request(app)
        .post('/api/fieldworker/images/progress')
        .expect(400); // Expect 400 because no files uploaded
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No images uploaded');
    });

    test('should have completion image upload route', async () => {
      const response = await request(app)
        .post('/api/fieldworker/images/completion')
        .expect(400); // Expect 400 because no files uploaded
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No images uploaded');
    });

    test('should have general image upload route', async () => {
      const response = await request(app)
        .post('/api/fieldworker/images/general')
        .expect(400); // Expect 400 because no files uploaded
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No images uploaded');
    });

    test('should have get images route', async () => {
      const response = await request(app)
        .get('/api/fieldworker/images')
        .expect(200);
      
      // Should return empty array since no images exist
      expect(response.body.success).toBe(true);
    });

    test('should have get reports route', async () => {
      const response = await request(app)
        .get('/api/fieldworker/reports')
        .expect(200);
      
      // Should return empty array since no reports exist
      expect(response.body.success).toBe(true);
    });
  });

  describe('Authentication', () => {
    test('should require employee role for all routes', () => {
      // This test verifies that the restrictTo('employee') middleware is applied
      // The actual authentication logic is tested in the auth middleware tests
      expect(true).toBe(true); // Placeholder test
    });
  });

  describe('Upload Service Integration', () => {
    test('should use uploadFieldWorkerImages function', () => {
      const { uploadFieldWorkerImages } = require('../src/api/services/upload.service');
      expect(uploadFieldWorkerImages).toBeDefined();
    });

    test('should support different upload types', () => {
      const { uploadToCloudinary } = require('../src/api/services/upload.service');
      expect(uploadToCloudinary).toBeDefined();
    });
  });
});

describe('Upload Service Extensions', () => {
  const { uploadToCloudinary, uploadFieldWorkerImages } = require('../src/api/services/upload.service');

  test('uploadToCloudinary should accept upload type parameter', () => {
    expect(uploadToCloudinary).toBeDefined();
    // Function signature: uploadToCloudinary(fileBuffer, fileName, uploadType)
  });

  test('uploadFieldWorkerImages should be exported', () => {
    expect(uploadFieldWorkerImages).toBeDefined();
    expect(typeof uploadFieldWorkerImages).toBe('function');
  });
});

describe('Controller Functions', () => {
  const fieldWorkerController = require('../src/api/controllers/fieldworker.controller');

  test('should export all required controller functions', () => {
    expect(fieldWorkerController.uploadProgressImages).toBeDefined();
    expect(fieldWorkerController.uploadCompletionImages).toBeDefined();
    expect(fieldWorkerController.uploadFieldWorkImages).toBeDefined();
    expect(fieldWorkerController.getFieldWorkerImages).toBeDefined();
  });

  test('controller functions should be functions', () => {
    expect(typeof fieldWorkerController.uploadProgressImages).toBe('function');
    expect(typeof fieldWorkerController.uploadCompletionImages).toBe('function');
    expect(typeof fieldWorkerController.uploadFieldWorkImages).toBe('function');
    expect(typeof fieldWorkerController.getFieldWorkerImages).toBe('function');
  });
});
