import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface AzureDevOpsPasswordModalProps {
  // ProjectId is not directly used in the component but passed to parent via onUnlock
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (password: string) => Promise<boolean>;
  hasCredentials: boolean;
}

/**
 * Modal component for prompting the user for their Azure DevOps credentials password
 */
export const AzureDevOpsPasswordModal: React.FC<AzureDevOpsPasswordModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onUnlock,
  hasCredentials,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the projectId and password to unlock credentials
      const success = await onUnlock(password);
      if (success) {
        setPassword('');
        onClose();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Failed to unlock credentials');
      console.error('Error unlocking credentials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {hasCredentials ? 'Unlock Azure DevOps Credentials' : 'Azure DevOps Integration'}
          </DialogTitle>
          <DialogDescription>
            {hasCredentials
              ? 'Enter your password to unlock Azure DevOps credentials for this project.'
              : 'This project has no Azure DevOps credentials configured yet.'}
          </DialogDescription>
        </DialogHeader>

        {hasCredentials ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleUnlock()}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
                Skip
              </Button>
              <Button onClick={handleUnlock} disabled={isLoading}>
                {isLoading ? 'Unlocking...' : 'Unlock'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-sm">
              You can configure Azure DevOps integration in the project settings.
            </p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleSkip}>
                Continue
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
