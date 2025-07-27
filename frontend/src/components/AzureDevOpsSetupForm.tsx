import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AzureDevOpsConfig } from '@/types';
import { AzureDevOpsService } from '@/services/azureDevOpsService';

interface AzureDevOpsSetupFormProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: () => void;
}

/**
 * Form component for setting up Azure DevOps credentials
 */
export const AzureDevOpsSetupForm: React.FC<AzureDevOpsSetupFormProps> = ({
  projectId,
  isOpen,
  onClose,
  onSetupComplete,
}) => {
  const [credentials, setCredentials] = useState<AzureDevOpsConfig>({
    organizationUrl: '',
    personalAccessToken: '',
    project: ''
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof AzureDevOpsConfig, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!credentials.organizationUrl) {
      setError('Organization URL is required');
      return false;
    }
    
    if (!credentials.personalAccessToken) {
      setError('Personal Access Token is required');
      return false;
    }
    
    if (!credentials.project) {
      setError('Project name is required');
      return false;
    }
    
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await AzureDevOpsService.storeCredentials(
        projectId,
        credentials,
        password
      );

      if (result.success) {
        // Reset form
        setCredentials({
          organizationUrl: '',
          personalAccessToken: '',
          project: ''
        });
        setPassword('');
        setConfirmPassword('');
        
        // Notify parent
        onSetupComplete();
        onClose();
      } else {
        setError(result.message || 'Failed to store credentials');
      }
    } catch (err) {
      setError('An error occurred while storing credentials');
      console.error('Error storing credentials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setCredentials({
      organizationUrl: '',
      personalAccessToken: '',
      project: ''
    });
    setPassword('');
    setConfirmPassword('');
    setError(null);
    
    // Close dialog
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Set Up Azure DevOps Integration</DialogTitle>
          <DialogDescription>
            Enter your Azure DevOps credentials to enable automatic syncing of user stories.
            Your credentials will be encrypted with a password of your choice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="organizationUrl" className="text-sm font-medium">
              Organization URL
            </label>
            <Input
              id="organizationUrl"
              placeholder="https://dev.azure.com/your-organization"
              value={credentials.organizationUrl}
              onChange={(e) => handleInputChange('organizationUrl', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="project" className="text-sm font-medium">
              Project Name
            </label>
            <Input
              id="project"
              placeholder="Your project name"
              value={credentials.project}
              onChange={(e) => handleInputChange('project', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pat" className="text-sm font-medium">
              Personal Access Token (PAT)
            </label>
            <Input
              id="pat"
              type="password"
              placeholder="Your personal access token"
              value={credentials.personalAccessToken}
              onChange={(e) => handleInputChange('personalAccessToken', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your PAT requires Work Items (Read, Write) permissions
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="setupPassword" className="text-sm font-medium">
              Encryption Password
            </label>
            <Input
              id="setupPassword"
              type="password"
              placeholder="Create a password to secure your credentials"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Credentials'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
