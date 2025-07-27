import { AzureDevOpsConfig, Feature, UserStory } from '../types';
import { apiClient } from './apiClient';

/**
 * Service for managing Azure DevOps credential operations
 */
export class AzureDevOpsService {
  /**
   * Store encrypted Azure DevOps credentials for a project
   * 
   * @param projectId Project ID
   * @param credentials Azure DevOps credentials
   * @param password Password to encrypt credentials
   * @returns Promise with result
   */
  static async storeCredentials(
    projectId: string,
    credentials: AzureDevOpsConfig,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`/projects/${projectId}/azure-credentials`, {
        credentials,
        password
      });
      return response.data;
    } catch (error: any) {
      console.error('Error storing Azure DevOps credentials:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to store Azure DevOps credentials'
      };
    }
  }

  /**
   * Unlock Azure DevOps credentials with password
   * 
   * @param projectId Project ID
   * @param password Password to decrypt credentials
   * @returns Promise with result, including any existing stories/features
   */
  static async unlockCredentials(
    projectId: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    existingStories?: UserStory[];
    existingFeatures?: Feature[];
  }> {
    try {
      const response = await apiClient.post(`/projects/${projectId}/unlock-credentials`, {
        password
      });
      return response.data;
    } catch (error: any) {
      console.error('Error unlocking Azure DevOps credentials:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to unlock Azure DevOps credentials'
      };
    }
  }

  /**
   * Lock Azure DevOps credentials (clear from memory)
   * 
   * @param projectId Project ID
   * @returns Promise with result
   */
  static async lockCredentials(
    projectId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`/projects/${projectId}/lock-credentials`);
      return response.data;
    } catch (error: any) {
      console.error('Error locking Azure DevOps credentials:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to lock Azure DevOps credentials'
      };
    }
  }
}
