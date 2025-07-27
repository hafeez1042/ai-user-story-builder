import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs-extra';
import projectRoutes from './routes/projects';
import modelsRoutes from './routes/models';

const app = express();
const PORT = process.env.PORT || 4000;

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data directory: ${dataDir}`);
});