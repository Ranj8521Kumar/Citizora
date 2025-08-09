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
    
    // Test login endpoint with invalid credentials to check if it's reachable
    try {
      await apiService.login('test@admin.com', 'invalidpassword');
    } catch (error) {
      if (error.message.includes('Invalid credentials') || error.message.includes('authentication')) {
        console.log('✅ Login endpoint is reachable');
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