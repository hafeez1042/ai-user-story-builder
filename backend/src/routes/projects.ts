import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs-extra';
import { Project, RequirementRequest, ConfirmationRequest, AzureDevOpsConfig } from '../types';
import { DocumentProcessor } from '../services/documentProcessor';
import { StoryGenerator } from '../services/storyGenerator';
import { AzureDevOpsService } from '../services/azureDevOps';
import { FileStorage } from '../services/fileStorage';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const dataDir = path.join(__dirname, '../../../data');

const documentProcessor = new DocumentProcessor();
const storyGenerator = new StoryGenerator();
const azureDevOpsService = new AzureDevOpsService();
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

router.get('/:id/stories', async (req, res) => {
  try {
    const stories = await fileStorage.getConfirmedStories(req.params.id);
    res.json(stories);
  } catch (error) {
    console.error('Error fetching confirmed stories:', error);
    res.status(500).json({ error: 'Failed to fetch confirmed stories' });
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
    const { requirement, model = 'deepseek-r1:14b', contextIds = [], azureDevOpsData } = req.body;
    
    if (!requirement) {
      return res.status(400).json({ error: 'Requirement text is required' });
    }

    const project = await fileStorage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get existing stories either from Azure DevOps data passed from frontend
    // or try to fetch them if credentials are unlocked
    let existingStories: any[] = [];
    let existingFeatures: any[] = [];
    
    if (azureDevOpsData?.existingStories) {
      // Use the existing stories provided by the frontend
      existingStories = azureDevOpsData.existingStories;
      existingFeatures = azureDevOpsData.existingFeatures || [];
    } else if (azureDevOpsService.hasUnlockedCredentials(projectId)) {
      // Fetch from Azure DevOps if credentials are unlocked
      const azureDevOpsResults = await azureDevOpsService.getExistingItems(projectId);
      existingStories = azureDevOpsResults.stories || [];
      existingFeatures = azureDevOpsResults.features || [];
    }
    
    // Get context content from relevant files
    const relevantContextFiles = contextIds.length > 0 
      ? project.contextFiles.filter(f => contextIds.includes(f.id))
      : project.contextFiles;
      
    const contextContent = relevantContextFiles.map(f => f.content).join('\n\n');
    
    const generatedContent = await storyGenerator.generateStories({
      requirement,
      context: contextContent,
      existingStories,
      existingFeatures,
      modelName: model,
      projectId
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

    let azureResults: any;
    
    if (azureDevOpsService.hasUnlockedCredentials()) {
      // If credentials are unlocked, use them to create work items
      azureResults = await azureDevOpsService.createWorkItems(projectId, { stories, features });
    } else {
      // If credentials aren't unlocked, return an error message
      azureResults = { 
        success: false, 
        message: 'Azure DevOps credentials not unlocked. Please provide password to unlock credentials.' 
      };
    }
    
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

// Azure DevOps credential management endpoints

// Set Azure DevOps credentials for a project
router.post('/:id/azure-credentials', async (req, res) => {
  try {
    const projectId = req.params.id;
    const { credentials, password } = req.body;
    
    if (!credentials || !password) {
      return res.status(400).json({ error: 'Credentials and password are required' });
    }

    const project = await fileStorage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Encrypt credentials with password
    const { encryptedCredentials, salt } = await azureDevOpsService.encryptCredentials(
      projectId, 
      credentials, 
      password
    );
    
    // Update project with encrypted credentials
    project.hasAzureDevOpsCredentials = true;
    project.encryptedAzureDevOpsCredentials = encryptedCredentials;
    project.azureDevOpsSalt = salt;
    
    await fileStorage.updateProject(project);
    
    res.json({ 
      success: true, 
      message: 'Azure DevOps credentials stored successfully' 
    });
  } catch (error) {
    console.error('Error setting Azure DevOps credentials:', error);
    res.status(500).json({ error: 'Failed to store Azure DevOps credentials' });
  }
});

router.post('/:id/unlock-credentials', async (req, res) => {
  try {
    const projectId = req.params.id;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const project = await fileStorage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (!project.hasAzureDevOpsCredentials) {
      return res.status(400).json({ error: 'No Azure DevOps credentials found for this project' });
    }
    
    // Try to unlock credentials with provided password
    const unlocked = await azureDevOpsService.unlockCredentials(project, password);
    
    if (!unlocked) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Initialize Azure DevOps connection
    await azureDevOpsService.initialize();
    
    // Return success and get existing stories from Azure DevOps
    const existingStories = await azureDevOpsService.getExistingUserStories(projectId);
    const existingFeatures = await azureDevOpsService.getExistingFeatures(projectId);
    
    res.json({ 
      success: true, 
      message: 'Azure DevOps credentials unlocked successfully',
      existingStories,
      existingFeatures
    });
  } catch (error) {
    console.error('Error unlocking Azure DevOps credentials:', error);
    res.status(500).json({ error: 'Failed to unlock Azure DevOps credentials' });
  }
});

// Lock Azure DevOps credentials (clear from memory)
router.post('/:id/lock-credentials', async (req, res) => {
  try {
    azureDevOpsService.lockCredentials();
    res.json({ success: true, message: 'Azure DevOps credentials locked successfully' });
  } catch (error) {
    console.error('Error locking Azure DevOps credentials:', error);
    res.status(500).json({ error: 'Failed to lock Azure DevOps credentials' });
  }
});

export default router;