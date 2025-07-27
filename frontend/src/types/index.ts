export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  contextFiles: ContextFile[];
  hasAzureDevOpsCredentials?: boolean;
  encryptedAzureDevOpsCredentials?: string;
  azureDevOpsSalt?: string;
}

export interface ContextFile {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  content: string;
  uploadedAt: string;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  storyPoints?: number;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  userStories: UserStory[];
}

export interface GeneratedContent {
  userStories: UserStory[];
  features: Feature[];
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface AzureDevOpsConfig {
  organizationUrl: string;
  personalAccessToken: string;
  project: string;
}