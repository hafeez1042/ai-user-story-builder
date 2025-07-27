import { GeneratedContent, UserStory, Feature } from '../types';
import { OllamaService } from './ollama';
import { ActivityLogger, ActivityType } from './activityLogger';

interface GenerationInput {
  requirement: string;
  context: string;
  existingStories: UserStory[];
  existingFeatures?: Feature[];
  modelName: string;
  projectId: string;
}

export class StoryGenerator {
  private ollamaService: OllamaService;

  constructor() {
    this.ollamaService = new OllamaService();
  }

  async generateStories(input: GenerationInput): Promise<GeneratedContent> {
    const logger = new ActivityLogger(input.projectId);
    logger.info('Starting user story generation process', { modelName: input.modelName });
    
    // Build prompt
    logger.processing('Building prompt from requirement and context');
    const prompt = this.buildPrompt(input);
    logger.prompt('Prompt ready for model', { 
      promptLength: prompt.length,
      prompt: prompt // Include full prompt text
    });
    
    try {
      // Send to model
      logger.info(`Sending prompt to ${input.modelName} model`);
      const startTime = Date.now();
      const response = await this.ollamaService.generateCompletion(input.modelName, prompt);
      const duration = Date.now() - startTime;
      logger.response('Received response from model', { 
        responseLength: response.length,
        durationMs: duration,
        response: response // Include full response text
      });
      
      // Parse response
      logger.processing('Parsing AI response into structured user stories');
      const result = this.parseResponse(response);
      // Organize stories under their respective features
      const storiesWithFeatures = this.organizeStoriesUnderFeatures(result.userStories, result.features);
      
      logger.info('Generation complete', { 
        storiesCount: result.userStories.length,
        featuresCount: result.features.length,
        organizedContent: storiesWithFeatures
      });
      
      return result;
    } catch (error) {
      logger.error('Error generating stories', { error: String(error) });
      console.error('Error generating stories:', error);
      throw error;
    }
  }

  private buildPrompt(input: GenerationInput): string {
    const { requirement, context, existingStories } = input;
    
    return `You are an expert business analyst and user story writer. Your task is to generate well-structured user stories and features based on the given requirement.

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
1. Generate minimum 1 user stories per requirement
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
    const logger = new ActivityLogger('unknown'); // Fallback logger for standalone parsing
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
      logger.error('Error parsing response:', { error: String(error) });
      console.error('Error parsing response:', error);
    }
    
    if (userStories.length === 0) {
      logger.info('No user stories found in response, generating default story');
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

  /**
   * Organizes user stories under their respective features based on content analysis
   * Also includes standalone stories that don't belong to any feature
   */
  private organizeStoriesUnderFeatures(stories: UserStory[], features: Feature[]) {
    // Create a deep copy of the features with empty userStories arrays
    const featuresWithStories = features.map(feature => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      userStories: [] as any[]
    }));
    
    // Create a copy of all stories to track which ones have been assigned
    const remainingStories = [...stories];
    
    // Simple heuristic to match stories to features based on title/description matching
    featuresWithStories.forEach(feature => {
      const featureWords = (feature.title + ' ' + feature.description).toLowerCase().split(/\W+/)
        .filter(word => word.length > 3); // Only consider words with length > 3
      
      // Find stories that match this feature
      const matchingStoryIndices: number[] = [];
      
      remainingStories.forEach((story, index) => {
        const storyText = (story.title + ' ' + story.description).toLowerCase();
        
        // Check if any significant feature words are in the story
        const matchScore = featureWords.filter(word => storyText.includes(word)).length;
        if (matchScore >= 1) { // If at least one significant word matches
          matchingStoryIndices.push(index);
        }
      });
      
      // Add matching stories to this feature and remove from remaining stories
      matchingStoryIndices.sort((a, b) => b - a); // Sort in reverse order for safe removal
      matchingStoryIndices.forEach(index => {
        const story = remainingStories[index];
        feature.userStories.push({
          id: story.id,
          title: story.title,
          priority: story.priority,
          storyPoints: story.storyPoints,
          description: story.description,
          acceptanceCriteria: story.acceptanceCriteria
        });
        remainingStories.splice(index, 1);
      });
    });
    
    // Return both features with stories and remaining standalone stories
    return {
      features: featuresWithStories,
      standaloneStories: remainingStories.map(story => ({
        id: story.id,
        title: story.title,
        priority: story.priority,
        storyPoints: story.storyPoints,
        description: story.description,
        acceptanceCriteria: story.acceptanceCriteria
      }))
    };
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}