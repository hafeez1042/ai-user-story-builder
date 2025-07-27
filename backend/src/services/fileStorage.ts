import fs from 'fs-extra';
import path from 'path';
import { Project, UserStory, Feature } from '../types';

interface ConfirmedStoryData {
  stories: UserStory[];
  features: Feature[];
  azureResults: any[];
  timestamp: string;
}

export class FileStorage {
  private dataDir: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
    fs.ensureDirSync(dataDir);
  }

  async createProject(project: Project): Promise<void> {
    const projectDir = path.join(this.dataDir, project.id);
    await fs.ensureDir(projectDir);
    
    const projectFile = path.join(projectDir, 'project.json');
    await fs.writeJson(projectFile, project, { spaces: 2 });
  }

  async getProject(projectId: string): Promise<Project | null> {
    try {
      const projectFile = path.join(this.dataDir, projectId, 'project.json');
      if (!(await fs.pathExists(projectFile))) {
        return null;
      }
      return await fs.readJson(projectFile);
    } catch (error) {
      console.error('Error reading project:', error);
      return null;
    }
  }

  async updateProject(project: Project): Promise<void> {
    const projectFile = path.join(this.dataDir, project.id, 'project.json');
    await fs.writeJson(projectFile, project, { spaces: 2 });
  }

  async getProjects(): Promise<Project[]> {
    try {
      const dirs = await fs.readdir(this.dataDir);
      const projects: Project[] = [];

      for (const dir of dirs) {
        const projectPath = path.join(this.dataDir, dir);
        const stat = await fs.stat(projectPath);
        
        if (stat.isDirectory()) {
          const project = await this.getProject(dir);
          if (project) {
            projects.push(project);
          }
        }
      }

      return projects.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error reading projects:', error);
      return [];
    }
  }

  async saveConfirmedStories(projectId: string, data: ConfirmedStoryData): Promise<void> {
    const projectDir = path.join(this.dataDir, projectId);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}.md`;
    const filepath = path.join(projectDir, filename);

    const markdownContent = this.generateMarkdown(data);
    await fs.writeFile(filepath, markdownContent, 'utf-8');

    const metadataFile = path.join(projectDir, `${timestamp}.json`);
    await fs.writeJson(metadataFile, data, { spaces: 2 });
  }

  private generateMarkdown(data: ConfirmedStoryData): string {
    const { stories, features, timestamp } = data;
    
    let markdown = `# User Stories and Features\n\n`;
    markdown += `**Generated:** ${new Date(timestamp).toLocaleString()}\n\n`;

    if (features.length > 0) {
      markdown += `## Features\n\n`;
      features.forEach((feature, index) => {
        markdown += `### ${index + 1}. ${feature.title}\n\n`;
        markdown += `**Description:** ${feature.description}\n\n`;
        if (feature.userStories.length > 0) {
          markdown += `**Related User Stories:**\n`;
          feature.userStories.forEach(story => {
            markdown += `- ${story.title}\n`;
          });
          markdown += `\n`;
        }
        markdown += `---\n\n`;
      });
    }

    if (stories.length > 0) {
      markdown += `## User Stories\n\n`;
      stories.forEach((story, index) => {
        markdown += `### ${index + 1}. ${story.title}\n\n`;
        markdown += `**Description:** ${story.description}\n\n`;
        
        if (story.acceptanceCriteria.length > 0) {
          markdown += `**Acceptance Criteria:**\n`;
          story.acceptanceCriteria.forEach(criteria => {
            markdown += `- [ ] ${criteria}\n`;
          });
          markdown += `\n`;
        }
        
        markdown += `**Priority:** ${story.priority}\n`;
        if (story.storyPoints) {
          markdown += `**Story Points:** ${story.storyPoints}\n`;
        }
        markdown += `\n---\n\n`;
      });
    }

    return markdown;
  }

  async getProjectHistory(projectId: string): Promise<string[]> {
    try {
      const projectDir = path.join(this.dataDir, projectId);
      if (!(await fs.pathExists(projectDir))) {
        return [];
      }

      const files = await fs.readdir(projectDir);
      return files
        .filter(file => file.endsWith('.md'))
        .sort()
        .reverse();
    } catch (error) {
      console.error('Error reading project history:', error);
      return [];
    }
  }
}