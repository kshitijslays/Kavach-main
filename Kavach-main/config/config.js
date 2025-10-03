// Configuration file for API endpoints and app settings
export const config = {
  // Development API URL - change this to your backend server URL  
  API_BASE_URL: 'http://localhost:5000/api', // Backend runs on 5000, frontend on 8082
  
  // If deploying to production, you can change this to:
  // API_BASE_URL: 'https://your-backend-domain.com/api',
  
  // For testing with Expo on physical device, use your computer's IP:
  // API_BASE_URL: 'http://192.168.1.100:5000/api', // Replace with your IP
  
  // App settings
  APP_NAME: 'Kavach',
  OTP_LENGTH: 6,
  OTP_RESEND_TIMER: 30, // seconds
  
  // API timeout
  API_TIMEOUT: 10000, // 10 seconds
};