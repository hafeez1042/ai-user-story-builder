import { GeneratedContent, UserStory, Feature } from '../types';
import { OllamaService } from './ollama';

interface GenerationInput {
  requirement: string;
  context: string;
  existingStories: UserStory[];
  modelName: string;
}

export class StoryGenerator {
  private ollamaService: OllamaService;

  constructor() {
    this.ollamaService = new OllamaService();
  }

  async generateStories(input: GenerationInput): Promise<GeneratedContent> {
    const prompt = this.buildPrompt(input);
    
    try {
      const response = await this.ollamaService.generateCompletion(input.modelName, prompt);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Error generating stories:', error);
      throw error;
    }
  }

  private buildPrompt(input: GenerationInput): string {
    const { requirement, context, existingStories } = input;
    
    return `You are an expert product manager and user story writer. Your task is to generate well-structured user stories and features based on the given requirement.

CONTEXT DOCUMENTS:
${context || 'No context documents provided.'}

EXISTING USER STORIES:
${existingStories.length > 0 
  ? existingStories.map(story => `- ${story.title}: ${story.description}`).join('\n')
  : 'No existing user stories found.'
}

NEW REQUIREMENT:
${requirement}

Please generate user stories and features based on this requirement. Format your response as markdown with the following structure:

## Features

### Feature 1: [Feature Title]
**Description:** [Feature description]

## User Stories

### Story 1: [User Story Title]
**As a** [user type]
**I want** [functionality]
**So that** [benefit/value]

**Description:** [Detailed description]

**Acceptance Criteria:**
- [ ] [Criteria 1]
- [ ] [Criteria 2]
- [ ] [Criteria 3]

**Priority:** [Low/Medium/High/Critical]
**Story Points:** [1-13]

---

### Story 2: [User Story Title]
[Continue with same format...]

IMPORTANT GUIDELINES:
1. Generate 2-5 user stories per requirement
2. Include relevant features that group related stories
3. Make stories independent and testable
4. Use clear, concise language
5. Avoid duplicating existing stories
6. Include realistic story point estimates
7. Set appropriate priorities based on business value
8. Each story should follow the "As a... I want... So that..." format
9. Acceptance criteria should be specific and measurable

Generate the response now:`;
  }

  private parseResponse(response: string): GeneratedContent {
    const userStories: UserStory[] = [];
    const features: Feature[] = [];
    
    try {
      const lines = response.split('\n');
      let currentSection: 'feature' | 'story' | 'none' = 'none';
      let currentStory: Partial<UserStory> = {};
      let currentFeature: Partial<Feature> = {};
      let acceptanceCriteria: string[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('### Feature')) {
          if (currentFeature.title) {
            features.push({
              id: this.generateId(),
              title: currentFeature.title,
              description: currentFeature.description || '',
              userStories: []
            } as Feature);
          }
          currentSection = 'feature';
          currentFeature = {
            title: trimmedLine.replace('### Feature', '').replace(/^\d+:\s*/, '').trim()
          };
        } else if (trimmedLine.startsWith('### Story')) {
          if (currentStory.title) {
            userStories.push({
              id: this.generateId(),
              title: currentStory.title,
              description: currentStory.description || '',
              acceptanceCriteria,
              priority: (currentStory.priority as any) || 'Medium',
              storyPoints: currentStory.storyPoints
            } as UserStory);
          }
          currentSection = 'story';
          currentStory = {
            title: trimmedLine.replace('### Story', '').replace(/^\d+:\s*/, '').trim()
          };
          acceptanceCriteria = [];
        } else if (trimmedLine.startsWith('**Description:**')) {
          const description = trimmedLine.replace('**Description:**', '').trim();
          if (currentSection === 'feature') {
            currentFeature.description = description;
          } else if (currentSection === 'story') {
            currentStory.description = description;
          }
        } else if (trimmedLine.startsWith('**Priority:**')) {
          const priority = trimmedLine.replace('**Priority:**', '').trim();
          currentStory.priority = priority as any;
        } else if (trimmedLine.startsWith('**Story Points:**')) {
          const points = trimmedLine.replace('**Story Points:**', '').trim();
          currentStory.storyPoints = parseInt(points) || undefined;
        } else if (trimmedLine.startsWith('- [ ]')) {
          const criteria = trimmedLine.replace('- [ ]', '').trim();
          acceptanceCriteria.push(criteria);
        } else if (trimmedLine.startsWith('**As a**')) {
          const asA = trimmedLine.replace('**As a**', '').trim();
          if (!currentStory.description) {
            currentStory.description = `As a ${asA}`;
          }
        } else if (trimmedLine.startsWith('**I want**')) {
          const iWant = trimmedLine.replace('**I want**', '').trim();
          if (currentStory.description) {
            currentStory.description += ` I want ${iWant}`;
          }
        } else if (trimmedLine.startsWith('**So that**')) {
          const soThat = trimmedLine.replace('**So that**', '').trim();
          if (currentStory.description) {
            currentStory.description += ` So that ${soThat}`;
          }
        }
      }
      
      if (currentFeature.title) {
        features.push({
          id: this.generateId(),
          title: currentFeature.title,
          description: currentFeature.description || '',
          userStories: []
        } as Feature);
      }
      
      if (currentStory.title) {
        userStories.push({
          id: this.generateId(),
          title: currentStory.title,
          description: currentStory.description || '',
          acceptanceCriteria,
          priority: (currentStory.priority as any) || 'Medium',
          storyPoints: currentStory.storyPoints
        } as UserStory);
      }
      
    } catch (error) {
      console.error('Error parsing response:', error);
    }
    
    if (userStories.length === 0) {
      userStories.push({
        id: this.generateId(),
        title: 'Generated User Story',
        description: 'Based on the provided requirement, implement the requested functionality.',
        acceptanceCriteria: [
          'Functionality works as expected',
          'User interface is intuitive',
          'Performance meets requirements'
        ],
        priority: 'Medium',
        storyPoints: 5
      });
    }
    
    return { userStories, features };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}