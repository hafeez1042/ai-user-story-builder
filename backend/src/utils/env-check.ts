/**
 * Environment Variables Check Utility
 * 
 * Use this utility to verify that environment variables are properly loaded
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs-extra';

/**
 * Load and verify environment variables
 */
export function checkEnvironmentVariables() {
  // Ensure dotenv is loaded
  dotenv.config();
  
  console.log('\n=== Environment Variables Check ===\n');
  
  // Load example file to see what variables we should have
  const exampleEnvPath = path.join(__dirname, '../../.env.example');
  
  if (fs.existsSync(exampleEnvPath)) {
    const exampleContent = fs.readFileSync(exampleEnvPath, 'utf-8');
    const exampleVars = exampleContent
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('#'))
      .map(line => line.split('=')[0].trim());
    
    console.log(`Found ${exampleVars.length} configurable variables in .env.example\n`);
    
    // Check each variable
    exampleVars.forEach(variable => {
      const value = process.env[variable];
      if (value !== undefined) {
        // Don't log sensitive values like tokens
        const isSensitive = variable.includes('TOKEN') || 
                           variable.includes('KEY') || 
                           variable.includes('SECRET') ||
                           variable.includes('PAT');
        
        console.log(`✅ ${variable}: ${isSensitive ? '[REDACTED]' : value}`);
      } else {
        console.log(`❌ ${variable}: Not defined (using default if available)`);
      }
    });
    
    console.log('\n=== Additional Environment Variables ===\n');
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  } else {
    console.log('❌ .env.example file not found');
  }
  
  console.log('\n=================================\n');
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkEnvironmentVariables();
}
