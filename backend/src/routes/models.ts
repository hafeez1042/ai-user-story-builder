import express from 'express';
import { OllamaService } from '../services/ollama';

const router = express.Router();
const ollamaService = new OllamaService();

router.get('/', async (req, res) => {
  try {
    const models = await ollamaService.getAvailableModels();
    res.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch available models' });
  }
});

export default router;