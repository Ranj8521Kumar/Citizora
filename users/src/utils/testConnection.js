import apiService from '../services/api.js';

export async function testApiConnection() {
  try {
    console.log('Testing API connection...');
    
    // Test health check
    const health = await apiService.healthCheck();
    console.log('✅ Health check passed:', health);
    
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
}

export async function testAuthEndpoints() {
  try {
    console.log('Testing auth endpoints...');
    
    // Test registration (this will fail with invalid data, but we can check if endpoint is reachable)
    try {
      await apiService.register('Test', 'User', 'test@test.com', 'password123');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('validation')) {
        console.log('✅ Registration endpoint is reachable');
      } else {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Auth endpoints test failed:', error);
    return false;
  }
}

// Run tests when imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    testApiConnection();
    testAuthEndpoints();
  }, 1000);
}
