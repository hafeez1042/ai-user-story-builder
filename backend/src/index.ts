// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables as early as possible
dotenv.config();

import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import http from 'http';
import { Server } from 'socket.io';
import projectRoutes from './routes/projects';
import modelsRoutes from './routes/models';

const app = express();
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// Setup Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Export socket.io instance for use in other files
export { io };

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use DATA_DIR from environment or default to '../../data' relative to __dirname
const dataDir = process.env.DATA_DIR
  ? (path.isAbsolute(process.env.DATA_DIR)
    ? process.env.DATA_DIR
    : path.join(__dirname, process.env.DATA_DIR))
  : path.join(__dirname, '../../data');
fs.ensureDirSync(dataDir);

app.use('/api/projects', projectRoutes);
app.use('/api/models', modelsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io event handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Import the environment check utility
import { checkEnvironmentVariables } from './utils/env-check';

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data directory: ${dataDir}`);
  console.log('Socket.IO server enabled');
  
  // Check environment variables on startup if in development mode
  if (process.env.NODE_ENV !== 'production') {
    checkEnvironmentVariables();
  }
});