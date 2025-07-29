import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/services/api'
import { Project, OllamaModel, UserStory, Feature } from '@/types'
import { CompactContextUpload } from '@/components/CompactContextUpload'
import { ModelSelector } from '@/components/ModelSelector'
import { ActivityLog } from '@/components/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'
import { AzureDevOpsPasswordModal } from '@/components/AzureDevOpsPasswordModal'
import { AzureDevOpsSetupForm } from '@/components/AzureDevOpsSetupForm'
import { AzureDevOpsService } from '@/services/azureDevOpsService'
import { StoryManagementService } from '@/services/storyManagementService'
import { ConfirmedStoriesSidebar } from '@/components/ConfirmedStoriesSidebar'

export function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [requirement, setRequirement] = useState('')
  const [models, setModels] = useState<OllamaModel[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('deepseek-r1:14b')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  
  // Azure DevOps integration
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [azureDevOpsUnlocked, setAzureDevOpsUnlocked] = useState(false)
  const [existingAzureDevOpsStories, setExistingAzureDevOpsStories] = useState<UserStory[]>([])
  const [existingAzureDevOpsFeatures, setExistingAzureDevOpsFeatures] = useState<Feature[]>([])
  
  // Socket activity log
  const { activities, isProcessing, clearActivities } = useActivityLog(id || '')

  useEffect(() => {
    if (id) {
      loadProject()
      loadModels()
    }
  }, [id])
  
  // Check if the project has Azure DevOps credentials and prompt for password
  useEffect(() => {
    if (project && project.hasAzureDevOpsCredentials && !azureDevOpsUnlocked) {
      setShowPasswordModal(true)
    }
  }, [project, azureDevOpsUnlocked])

  const loadProject = async () => {
    try {
      const projectData = await api.getProject(id!)
      setProject(projectData)
      
      // Reset Azure DevOps state when loading a new project
      setAzureDevOpsUnlocked(false)
      setExistingAzureDevOpsStories([])
      setExistingAzureDevOpsFeatures([])
    } catch (error) {
      console.error('Failed to load project:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const loadModels = async () => {
    try {
      const modelsData = await api.getModels()
      setModels(modelsData)
    } catch (error) {
      console.error('Failed to load models:', error)
    }
  }

  const handleContextUploaded = (updatedProject: Project) => {
    setProject(updatedProject)
  }
  
  /**
   * Handle unlocking Azure DevOps credentials with password
   */
  const handleUnlockAzureDevOpsCredentials = async (password: string): Promise<boolean> => {
    if (!project) return false
    
    try {
      const result = await AzureDevOpsService.unlockCredentials(project.id, password)
      
      if (result.success) {
        setAzureDevOpsUnlocked(true)
        
        // Store existing stories and features from Azure DevOps
        if (result.existingStories) {
          setExistingAzureDevOpsStories(result.existingStories)
        }
        
        if (result.existingFeatures) {
          setExistingAzureDevOpsFeatures(result.existingFeatures)
        }
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to unlock Azure DevOps credentials:', error)
      return false
    }
  }

  const handleGenerateStories = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return;
    setGenerating(true)
    
    try {
      const existingAzureStoriesData = azureDevOpsUnlocked ? {
        existingStories: existingAzureDevOpsStories,
        existingFeatures: existingAzureDevOpsFeatures
      } : undefined;

      const response = await api.generateStories(project.id, requirement, selectedModel, existingAzureStoriesData)
      console.log('API response received:', response)
      
      // Determine the correct structure of the response
      // TypeScript doesn't know about the data property, so use type assertion
      const contentToStore = (response as any).data || response
      console.log('Content to store in session storage:', contentToStore)
      
      // Store the generated content in session storage
      sessionStorage.setItem(`generatedContent-${project.id}`, JSON.stringify(contentToStore))
      
      // Navigate to the generated stories page
      navigate(`/project/${project.id}/stories`)
    } catch (error) {
      console.error('Failed to generate stories:', error)
      alert('Failed to generate stories. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  // Story management handlers
  const handleRemoveFeature = async (featureId: string) => {
    if (!project) return;
    try {
      const result = await StoryManagementService.removeFeature(project.id, featureId);
      if (result.success) {
        // Update local state with the changes
        const updatedLog = [...activities];
        
        // Find all activity entries with organized content
        updatedLog.forEach(activity => {
          if (activity.type === 'response' && activity.data?.organizedContent) {
            // Remove the feature from the list
            activity.data.organizedContent.features = 
              activity.data.organizedContent.features.filter((f: any) => f.id !== featureId);
            
            // Update stories that were detached from the feature
            if (result.detachedStories?.length) {
              // Find the stories that were detached
              const detachedStories = activity.data.organizedContent.features
                .flatMap((f: any) => f.userStories || [])
                .filter((s: any) => s.featureId === featureId || result.detachedStories?.includes(s.id));
              
              // Add them to standalone stories
              activity.data.organizedContent.standaloneStories = [
                ...activity.data.organizedContent.standaloneStories,
                ...detachedStories.map((s: any) => ({ ...s, featureId: null }))
              ];
            }
          }
        });
        
        clearActivities()
        updatedLog.forEach(activity => {
          clearActivities()
          activities.push(activity)
        })
      }
    } catch (error) {
      console.error('Error removing feature:', error);
    }
  };
  
  const handleRemoveStory = async (storyId: string) => {
    if (!project) return;
    try {
      const result = await StoryManagementService.removeStory(project.id, storyId);
      if (result.success) {
        // Update local state with the changes
        const updatedLog = [...activities];
        
        // Find all activity entries with organized content
        updatedLog.forEach(activity => {
          if (activity.type === 'response' && activity.data?.organizedContent) {
            // Remove the story from features
            activity.data.organizedContent.features = activity.data.organizedContent.features.map((feature: any) => ({
              ...feature,
              userStories: (feature.userStories || []).filter((story: any) => story.id !== storyId)
            }));
            
            // Remove the story from standalone stories
            activity.data.organizedContent.standaloneStories = 
              activity.data.organizedContent.standaloneStories.filter((story: any) => story.id !== storyId);
          }
        });
        
        clearActivities()
        updatedLog.forEach(activity => {
          clearActivities()
          activities.push(activity)
        })
      }
    } catch (error) {
      console.error('Error removing story:', error);
    }
  };
  
  const handleEditFeature = async (featureId: string, updatedFeature: Partial<Feature>) => {
    if (!project) return;
    try {
      const result = await StoryManagementService.updateFeature(project.id, featureId, updatedFeature);
      if (result.success && result.feature) {
        // Update local state with the changes
        const updatedLog = [...activities];
        
        // Find all activity entries with organized content
        updatedLog.forEach(activity => {
          if (activity.type === 'response' && activity.data?.organizedContent) {
            // Update the feature
            activity.data.organizedContent.features = activity.data.organizedContent.features.map((feature: any) => 
              feature.id === featureId ? { ...feature, ...updatedFeature } : feature
            );
          }
        });
        
        clearActivities()
        updatedLog.forEach(activity => {
          clearActivities()
          activities.push(activity)
        })
      }
    } catch (error) {
      console.error('Error updating feature:', error);
    }
  };
  
  const handleEditStory = async (storyId: string, updatedStory: Partial<UserStory>) => {
    if (!project) return;
    try {
      const result = await StoryManagementService.updateStory(project.id, storyId, updatedStory);
      if (result.success && result.story) {
        // Update local state with the changes
        const updatedLog = [...activities];
        
        // Find all activity entries with organized content
        updatedLog.forEach(activity => {
          if (activity.type === 'response' && activity.data?.organizedContent) {
            // Update the story in features
            activity.data.organizedContent.features = activity.data.organizedContent.features.map((feature: any) => ({
              ...feature,
              userStories: (feature.userStories || []).map((story: any) => 
                story.id === storyId ? { ...story, ...updatedStory } : story
              )
            }));
            
            // Update the story in standalone stories
            activity.data.organizedContent.standaloneStories = 
              activity.data.organizedContent.standaloneStories.map((story: any) => 
                story.id === storyId ? { ...story, ...updatedStory } : story
              );
          }
        });
        
        clearActivities()
        updatedLog.forEach(activity => {
          clearActivities()
          activities.push(activity)
        })
      }
    } catch (error) {
      console.error('Error updating story:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested project could not be found.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 pr-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSetupModal(true)}
            className="flex items-center gap-1"
          >
            {project.hasAzureDevOpsCredentials ? (
              <>
                {azureDevOpsUnlocked ? (
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-amber-500 mr-1"></span>
                )}
                Azure DevOps Settings
              </>
            ) : (
              <>Set Up Azure DevOps</>
            )}
          </Button>
          
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <CompactContextUpload 
          project={project} 
          onContextUploaded={handleContextUploaded}
        />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Requirement Input
            </CardTitle>
            <CardDescription>
              Enter a single requirement to generate user stories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your requirement here..."
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              className="min-h-[200px]"
            />
            <Button 
              onClick={handleGenerateStories}
              disabled={!requirement.trim() || generating}
              className="w-full"
            >
              {generating ? 'Generating...' : 'Generate Stories'}
            </Button>
            
            <ActivityLog 
              activities={activities} 
              isProcessing={isProcessing || generating}
              onRemoveFeature={handleRemoveFeature}
              onRemoveStory={handleRemoveStory}
              onEditFeature={handleEditFeature}
              onEditStory={handleEditStory}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Azure DevOps Password Modal */}
      <AzureDevOpsPasswordModal
        projectId={project.id}
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onUnlock={handleUnlockAzureDevOpsCredentials}
        hasCredentials={project.hasAzureDevOpsCredentials || false}
      />
      
      {/* Azure DevOps Setup Form */}
      <AzureDevOpsSetupForm
        projectId={project.id}
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSetupComplete={() => {
          // Reload project to get updated credentials status
          loadProject();
        }}
      />

      <ConfirmedStoriesSidebar projectId={project.id} />
    </div>
  )
}