import { apiClient } from './apiClient';
import { Feature, UserStory } from '@/types';

/**
 * Service for managing features and user stories
 */
export const StoryManagementService = {
  /**
   * Remove a feature and detach its stories
   */
  removeFeature: async (projectId: string, featureId: string): Promise<{
    success: boolean;
    message: string;
    detachedStories?: string[];
  }> => {
    try {
      const response = await apiClient.delete(`/projects/${projectId}/features/${featureId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing feature:', error);
      return {
        success: false,
        message: 'Failed to remove feature'
      };
    }
  },

  /**
   * Remove a user story
   */
  removeStory: async (projectId: string, storyId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await apiClient.delete(`/projects/${projectId}/stories/${storyId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing story:', error);
      return {
        success: false,
        message: 'Failed to remove story'
      };
    }
  },

  /**
   * Update a feature
   */
  updateFeature: async (
    projectId: string,
    featureId: string,
    updates: Partial<Feature>
  ): Promise<{
    success: boolean;
    message: string;
    feature?: Feature;
  }> => {
    try {
      const response = await apiClient.put(`/projects/${projectId}/features/${featureId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating feature:', error);
      return {
        success: false,
        message: 'Failed to update feature'
      };
    }
  },

  /**
   * Update a user story
   */
  updateStory: async (
    projectId: string,
    storyId: string,
    updates: Partial<UserStory>
  ): Promise<{
    success: boolean;
    message: string;
    story?: UserStory;
  }> => {
    try {
      const response = await apiClient.put(`/projects/${projectId}/stories/${storyId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating story:', error);
      return {
        success: false,
        message: 'Failed to update story'
      };
    }
  }
};
