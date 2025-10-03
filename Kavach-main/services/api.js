import axios from 'axios';
import { config } from '../config/config';

// API configuration

// Create axios instance with default config
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.data);
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    
    // Handle duplicate request as success (409 status)
    if (error.response?.status === 409) {
      console.log('⚠️ Duplicate request detected, treating as success');
      return { message: "Verification already in progress - please wait" };
    }
    
    const message = error.response?.data?.message || error.message || 'Network error';
    console.error('❌ Error message:', message);
    throw new Error(message);
  }
);

// Auth API functions
export const authAPI = {
  sendOTP: (email) => api.post('/auth/send-otp', { email }),
  
  verifyOTP: (email, otp, name = null, phone = null) => 
    api.post('/auth/verify-otp', { email, otp, name, phone }),
  
  googleLogin: (idToken) => 
    api.post('/auth/google-login', { idToken }),
};

export { config };