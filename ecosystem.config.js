module.exports = {
  apps: [
    {
      name: 'story-builder-backend',
      cwd: './backend',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      // Environment variables are loaded from the backend/.env file
    },
    {
      name: 'story-builder-frontend',
      cwd: './frontend',
      script: 'node_modules/.bin/vite',
      args: 'preview',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      // Environment variables are loaded from the frontend/.env file
    }
  ]
};
