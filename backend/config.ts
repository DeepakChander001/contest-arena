// Environment configuration for 10X Contest Arena Backend
// Copy this to .env file and fill in your actual values

export const config = {
  // Circle.so API Configuration
  circleApiToken: process.env.CIRCLE_API_TOKEN || '',
  circleAdminApiToken: process.env.CIRCLE_ADMIN_API_TOKEN || '',
  circleApiUrl: process.env.VITE_CIRCLE_API_URL || 'https://app.circle.so/api/v1/headless/auth_token',
  
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // OAuth Configuration
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackUrl: process.env.CALLBACK_URL || 'http://localhost:3001/auth/callback',
  
  // Session Configuration
  sessionSecret: process.env.SESSION_SECRET || 'default-session-secret-change-in-production',
};

// Required environment variables
export const requiredEnvVars = [
  'CIRCLE_API_TOKEN',
  'CIRCLE_ADMIN_API_TOKEN',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SESSION_SECRET'
];

// Validate required environment variables
export function validateConfig() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n📝 Please create a .env file with the following template:');
    console.error(`
# Circle.so API Configuration
CIRCLE_API_TOKEN=your_circle_api_token_here
CIRCLE_ADMIN_API_TOKEN=your_circle_admin_api_token_here
VITE_CIRCLE_API_URL=https://app.circle.so/api/v1/headless/auth_token
VITE_CIRCLE_ADMIN_API_TOKEN=your_circle_admin_api_token_here

# Server Configuration
PORT=3001
NODE_ENV=development

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
CALLBACK_URL=http://localhost:3001/auth/callback

# Session Configuration
SESSION_SECRET=your_session_secret_here
    `);
    return false;
  }
  
  console.log('✅ All required environment variables are configured');
  return true;
}
