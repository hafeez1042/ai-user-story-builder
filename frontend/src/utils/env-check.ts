/**
 * Frontend Environment Variables Check Utility
 * 
 * Use this utility to verify that Vite environment variables are properly loaded
 */

import config from '../config';

/**
 * Check and log environment variables in the frontend
 */
export function checkEnvironmentVariables() {
  console.log('\n=== Frontend Environment Variables ===\n');
  
  // Log the config values
  console.log('API URL:', config.api.url);
  console.log('API Timeout:', config.api.timeout);
  console.log('Socket URL:', config.socket.url);
  console.log('App Name:', config.app.name);
  console.log('Default Theme:', config.app.defaultTheme);
  console.log('Azure Integration Enabled:', config.features.azureIntegration);
  console.log('Local Storage Enabled:', config.features.localStorage);
  console.log('Debug Mode:', config.debug);
  
  // Log all raw VITE_ environment variables
  console.log('\n=== Raw VITE_ Environment Variables ===\n');
  Object.keys(import.meta.env).forEach(key => {
    if (key.startsWith('VITE_')) {
      // Don't log sensitive values
      const isSensitive = key.includes('TOKEN') || 
                         key.includes('KEY') || 
                         key.includes('SECRET') ||
                         key.includes('PAT');
                         
      console.log(`${key}: ${isSensitive ? '[REDACTED]' : import.meta.env[key]}`);
    }
  });
  
  console.log('\n=================================\n');
}

// Export config for easy import
export { config };
