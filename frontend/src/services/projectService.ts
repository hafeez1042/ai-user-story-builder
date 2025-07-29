import { apiClient } from './apiClient';
import { UserStory } from '../types';

export const getConfirmedStories = async (projectId: string): Promise<UserStory[]> => {
  const response = await apiClient.get(`/projects/${projectId}/stories`);
  return response.data;
};
