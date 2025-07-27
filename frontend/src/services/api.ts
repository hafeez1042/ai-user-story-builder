import { Project, GeneratedContent, OllamaModel, UserStory, Feature } from '@/types';

const API_BASE = '/api';

class ApiService {
  private async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async createProject(data: { name: string; description?: string }): Promise<Project> {
    return this.fetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProjects(): Promise<Project[]> {
    return this.fetch<Project[]>('/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.fetch<Project>(`/projects/${id}`);
  }

  async uploadContext(projectId: string, files: FileList): Promise<{ files: any[] }> {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE}/projects/${projectId}/context`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async generateStories(
    projectId: string, 
    requirement: string, 
    modelName?: string, 
    azureDevOpsData?: { existingStories: any[], existingFeatures: any[] }
  ): Promise<GeneratedContent> {
    return this.fetch<GeneratedContent>(`/projects/${projectId}/requirement`, {
      method: 'POST',
      body: JSON.stringify({ 
        requirement, 
        model: modelName,
        azureDevOpsData
      }),
    });
  }

  async confirmStories(projectId: string, stories: UserStory[], features: Feature[]): Promise<{ success: boolean; azureResults: any[] }> {
    return this.fetch(`/projects/${projectId}/confirmed`, {
      method: 'PUT',
      body: JSON.stringify({ stories, features }),
    });
  }

  async getModels(): Promise<OllamaModel[]> {
    return this.fetch<OllamaModel[]>('/models');
  }
}

export const api = new ApiService();