import express from 'express';
import cors from 'cors';
import path from 'path';
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
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Export socket.io instance for use in other files
export { io };

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dataDir = path.join(__dirname, '../../data');
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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data directory: ${dataDir}`);
  console.log('Socket.IO server enabled');
});