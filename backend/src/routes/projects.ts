import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs-extra';
import { Project, RequirementRequest, ConfirmationRequest } from '../types';
import { DocumentProcessor } from '../services/documentProcessor';
import { StoryGenerator } from '../services/storyGenerator';
// import { AzureDevOpsService } from '../services/azureDevOps'; // Temporarily disabled due to TypeScript errors
import { FileStorage } from '../services/fileStorage';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const dataDir = path.join(__dirname, '../../../data');

const documentProcessor = new DocumentProcessor();
const storyGenerator = new StoryGenerator();
// const azureDevOpsService = new AzureDevOpsService(); // Temporarily disabled
const fileStorage = new FileStorage(dataDir);

router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project: Project = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date().toISOString(),
      contextFiles: []
    };

    await fileStorage.createProject(project);
    res.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.get('/', async (req, res) => {
  try {
    const projects = await fileStorage.getProjects();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await fileStorage.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.post('/:id/context', upload.array('files'), async (req, res) => {
  try {
    const projectId = req.params.id;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const project = await fileStorage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const content = await documentProcessor.processFile(file);
        return {
          id: uuidv4(),
          filename: `${uuidv4()}_${file.originalname}`,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          content,
          uploadedAt: new Date().toISOString()
        };
      })
    );

    project.contextFiles.push(...processedFiles);
    await fileStorage.updateProject(project);

    files.forEach(file => {
      fs.removeSync(file.path);
    });

    res.json({ files: processedFiles });
  } catch (error) {
    console.error('Error uploading context files:', error);
    res.status(500).json({ error: 'Failed to upload context files' });
  }
});

router.post('/:id/requirement', async (req, res) => {
  try {
    const projectId = req.params.id;
    const { text, modelName = 'deepseek-r1:14b' }: RequirementRequest = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Requirement text is required' });
    }

    const project = await fileStorage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // const existingStories = await azureDevOpsService.getExistingUserStories(projectId); // Temporarily disabled
    const existingStories: any[] = []; // Placeholder
    const contextContent = project.contextFiles.map(f => f.content).join('\n\n');
    
    const generatedContent = await storyGenerator.generateStories({
      requirement: text,
      context: contextContent,
      existingStories,
      modelName
    });

    res.json(generatedContent);
  } catch (error) {
    console.error('Error generating stories:', error);
    res.status(500).json({ error: 'Failed to generate stories' });
  }
});

router.put('/:id/confirmed', async (req, res) => {
  try {
    const projectId = req.params.id;
    const { stories, features }: ConfirmationRequest = req.body;
    
    const project = await fileStorage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // const azureResults = await azureDevOpsService.createWorkItems(projectId, { stories, features }); // Temporarily disabled
    const azureResults: any = { success: true, message: 'Azure DevOps integration temporarily disabled' }; // Placeholder
    
    await fileStorage.saveConfirmedStories(projectId, {
      stories,
      features,
      azureResults,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, azureResults });
  } catch (error) {
    console.error('Error confirming stories:', error);
    res.status(500).json({ error: 'Failed to confirm stories' });
  }
});

export default router;