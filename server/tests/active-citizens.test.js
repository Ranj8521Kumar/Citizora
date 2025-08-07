const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/api/models/user.model');

describe('Active Citizens API', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-connect-test');
  });

  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('GET /api/users/active-citizens', () => {
    it('should return active citizens data', async () => {
      // Create some test users
      const testUsers = [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123'
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'password123'
        },
        {
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob@example.com',
          password: 'password123'
        }
      ];

      // Insert test users
      await User.insertMany(testUsers);

      // Make request to active citizens endpoint
      const response = await request(app)
        .get('/api/users/active-citizens')
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('totalCitizens', 3);
      expect(response.body.data).toHaveProperty('recentCitizens');
      expect(Array.isArray(response.body.data.recentCitizens)).toBe(true);
      expect(response.body.data.recentCitizens).toHaveLength(3);

      // Verify recent citizens structure
      const recentCitizen = response.body.data.recentCitizens[0];
      expect(recentCitizen).toHaveProperty('firstName');
      expect(recentCitizen).toHaveProperty('lastName');
      expect(recentCitizen).toHaveProperty('createdAt');
      expect(recentCitizen).not.toHaveProperty('password'); // Should not include password
      expect(recentCitizen).not.toHaveProperty('email'); // Should not include email
    });

    it('should return empty data when no users exist', async () => {
      const response = await request(app)
        .get('/api/users/active-citizens')
        .expect(200);

      expect(response.body.data.totalCitizens).toBe(0);
      expect(response.body.data.recentCitizens).toHaveLength(0);
    });

    it('should limit recent citizens to 10', async () => {
      // Create 15 test users
      const testUsers = Array.from({ length: 15 }, (_, i) => ({
        firstName: `User${i}`,
        lastName: `Test${i}`,
        email: `user${i}@example.com`,
        password: 'password123'
      }));

      await User.insertMany(testUsers);

      const response = await request(app)
        .get('/api/users/active-citizens')
        .expect(200);

      expect(response.body.data.totalCitizens).toBe(15);
      expect(response.body.data.recentCitizens).toHaveLength(10); // Should be limited to 10
    });
  });
});
