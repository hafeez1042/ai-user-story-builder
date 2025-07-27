import axios from 'axios';

// Create an axios instance for API calls
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
