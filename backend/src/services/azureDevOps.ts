import { UserStory, Feature, AzureDevOpsConfig, Project } from '../types';
import { EncryptionService } from './encryptionService';

// This would be replaced with actual Azure DevOps SDK imports in a full implementation
// import * as azdev from 'azure-devops-node-api';

export class AzureDevOpsService {
  // Default config from environment (used as fallback)
  private defaultConfig: AzureDevOpsConfig;
  // Current active config (after password decryption)
  private activeConfig: AzureDevOpsConfig | null = null;

  constructor() {
    this.defaultConfig = {
      organizationUrl: process.env.AZURE_DEVOPS_ORG_URL || '',
      personalAccessToken: process.env.AZURE_DEVOPS_PAT || '',
      project: process.env.AZURE_DEVOPS_PROJECT || ''
    };
  }

  /**
   * Encrypt Azure DevOps credentials with a password for a specific project
   * 
   * @param projectId Project ID
   * @param credentials Azure DevOps credentials
   * @param password User password for encryption
   * @returns Encrypted data and salt
   */
  async encryptCredentials(projectId: string, credentials: AzureDevOpsConfig, password: string): 
    Promise<{ encryptedCredentials: string, salt: string }> {
    
    const credentialsJson = JSON.stringify(credentials);
    const { encryptedData, salt } = EncryptionService.encrypt(credentialsJson, password);
    
    return {
      encryptedCredentials: encryptedData,
      salt
    };
  }
  
  /**
   * Decrypt Azure DevOps credentials using a password
   * 
   * @param project Project with encrypted credentials
   * @param password Password to decrypt credentials
   * @returns True if decryption was successful
   */
  async unlockCredentials(project: Project, password: string): Promise<boolean> {
    if (!project.encryptedAzureDevOpsCredentials || !project.azureDevOpsSalt) {
      return false;
    }
    
    const decryptedJson = EncryptionService.decrypt(
      project.encryptedAzureDevOpsCredentials,
      password,
      project.azureDevOpsSalt
    );
    
    if (!decryptedJson) {
      return false;
    }
    
    try {
      this.activeConfig = JSON.parse(decryptedJson);
      return true;
    } catch (error) {
      console.error('Failed to parse decrypted Azure DevOps credentials:', error);
      return false;
    }
  }
  
  /**
   * Check if credentials are currently unlocked
   * @param projectId Optional project ID to check
   */
  hasUnlockedCredentials(projectId?: string): boolean {
    return this.activeConfig !== null;
  }
  
  /**
   * Clear unlocked credentials
   */
  lockCredentials(): void {
    this.activeConfig = null;
  }
  
  /**
   * Initialize the Azure DevOps connection
   * This would create an actual connection in a real implementation
   */
  async initialize(): Promise<void> {
    if (!this.activeConfig) {
      console.log('No active Azure DevOps configuration available');
      return;
    }
    
    console.log('Azure DevOps service initialized with project-specific credentials');
    // In a real implementation, this would initialize the Azure DevOps client
    // Example with the Azure DevOps SDK:
    // const authHandler = azdev.getPersonalAccessTokenHandler(this.activeConfig.personalAccessToken);
    // this.connection = new azdev.WebApi(this.activeConfig.organizationUrl, authHandler);
  }

  /**
   * Get existing user stories from Azure DevOps
   * 
   * @param projectId Project ID
   * @returns Array of user stories
   */
  async getExistingUserStories(projectId: string): Promise<UserStory[]> {
    if (!this.activeConfig) {
      console.log('No active Azure DevOps configuration - credentials not unlocked');
      return [];
    }
    
    console.log(`Fetching user stories for project ${projectId} from Azure DevOps`);
    // In a real implementation, this would query Azure DevOps API for work items
    // For now, return mock data
    return [
      {
        id: 'az-123',
        title: 'Sample Azure Story 1',
        description: 'This is a sample user story from Azure DevOps',
        acceptanceCriteria: ['Should work properly', 'Should have tests'],
        priority: 'Medium',
        storyPoints: 3
      },
      {
        id: 'az-456',
        title: 'Sample Azure Story 2',
        description: 'Another sample user story from Azure DevOps',
        acceptanceCriteria: ['Should be secure', 'Should be performant'],
        priority: 'High',
        storyPoints: 5
      }
    ];
  }

  /**
   * Get existing features from Azure DevOps
   * 
   * @param projectId Project ID
   * @returns Array of features
   */
  async getExistingFeatures(projectId: string): Promise<Feature[]> {
    if (!this.activeConfig) {
      console.log('No active Azure DevOps configuration - credentials not unlocked');
      return [];
    }
    
    console.log(`Fetching features for project ${projectId} from Azure DevOps`);
    // In a real implementation, this would query Azure DevOps API for features
    // For now, return mock data
    return [
      {
        id: 'az-feat-1',
        title: 'Sample Azure Feature 1',
        description: 'This is a sample feature from Azure DevOps',
        userStories: []
      },
      {
        id: 'az-feat-2',
        title: 'Sample Azure Feature 2',
        description: 'Another sample feature from Azure DevOps',
        userStories: []
      }
    ];
  }
  
  /**
   * Get both existing user stories and features from Azure DevOps
   * 
   * @param projectId Project ID
   * @returns Object containing arrays of stories and features
   */
  async getExistingItems(projectId: string): Promise<{ stories: UserStory[], features: Feature[] }> {
    const stories = await this.getExistingUserStories(projectId);
    const features = await this.getExistingFeatures(projectId);
    
    return { stories, features };
  }

  /**
   * Create work items in Azure DevOps
   * 
   * @param projectId Project ID
   * @param data User stories and features to create
   * @returns Array of created work item results
   */
  async createWorkItems(projectId: string, data: { stories: UserStory[], features: Feature[] }): Promise<any[]> {
    if (!this.activeConfig) {
      console.log('No active Azure DevOps configuration - credentials not unlocked');
      return [{ success: false, message: 'Azure DevOps credentials not unlocked' }];
    }
    
    console.log(`Creating work items for project ${projectId} in Azure DevOps`);
    console.log(`Using organization: ${this.activeConfig.organizationUrl}, project: ${this.activeConfig.project}`);
    
    // In a real implementation, this would use the Azure DevOps API to create work items
    // For now, simulate successful creation
    const results = [];
    
    for (const story of data.stories) {
      results.push({ 
        type: 'story', 
        id: Math.floor(Math.random() * 10000), 
        title: story.title, 
        success: true,
        message: `Successfully created in ${this.activeConfig.project} (simulated)`
      });
    }
    
    for (const feature of data.features) {
      results.push({ 
        type: 'feature', 
        id: Math.floor(Math.random() * 10000), 
        title: feature.title, 
        success: true,
        message: `Successfully created in ${this.activeConfig.project} (simulated)`
      });
    }
    
    return results;
  }
}