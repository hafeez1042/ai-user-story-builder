# PM2 Usage Guide for Story Builder v3

This guide explains how to use PM2 process manager to run the Story Builder v3 application in the background.

## What is PM2?

PM2 is a production process manager for Node.js applications that helps you keep your application alive and running in the background. It provides features like automatic restarts, logging, and monitoring.

## Prerequisites

Before using PM2, make sure you have it installed globally:

```bash
npm install -g pm2
```

## Available PM2 Commands

The following npm scripts are provided for PM2 management:

| Command | Description |
|---------|-------------|
| `npm run pm2:start` | Start both backend and frontend in production mode |
| `npm run pm2:start:dev` | Start both backend and frontend in development mode |
| `npm run pm2:stop` | Stop all services |
| `npm run pm2:restart` | Restart all services |
| `npm run pm2:delete` | Delete services from PM2 |
| `npm run pm2:status` | View status of running services |
| `npm run pm2:logs` | View logs for all services |
| `npm run pm2:monit` | Launch PM2 monitoring dashboard |

## Starting the Application

Before starting the application with PM2, make sure you have:

1. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. Built both the frontend and backend:
   ```bash
   npm run build
   ```

3. Start the application:
   ```bash
   npm run pm2:start
   ```

## Environment Configurations

The PM2 ecosystem config includes configurations for both development and production environments:

### Development Mode
```bash
npm run pm2:start:dev
```

This will:
- Set NODE_ENV to 'development'
- Use development-specific settings

### Production Mode
```bash
npm run pm2:start
```

This will:
- Set NODE_ENV to 'production'
- Use production-specific settings

## Monitoring

You can monitor your applications with:

```bash
npm run pm2:status  # Basic status overview
npm run pm2:monit   # Interactive monitoring dashboard
```

## Viewing Logs

To view logs for all services:

```bash
npm run pm2:logs
```

To view logs for a specific service:

```bash
pm2 logs story-builder-backend   # Backend logs only
pm2 logs story-builder-frontend  # Frontend logs only
```

## Customizing PM2 Configuration

The PM2 configuration is stored in `ecosystem.config.js` in the project root. You can modify this file to adjust:

- Process instances
- Memory limits
- Environment variables
- Watch settings
- Log file locations

## Automatic Startup on System Boot

To make your application start automatically when your server boots:

```bash
pm2 startup
```

Follow the instructions displayed to set up the startup script.

After your processes are running as desired, save the current process list:

```bash
pm2 save
```

Now PM2 will automatically resurrect the processes when the server restarts.
