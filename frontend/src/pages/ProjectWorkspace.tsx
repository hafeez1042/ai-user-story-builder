import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, FileText, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/services/api'
import { Project, GeneratedContent, OllamaModel } from '@/types'
import { ContextUpload } from '@/components/ContextUpload'
import { GeneratedStoriesPanel } from '@/components/GeneratedStoriesPanel'
import { ModelSelector } from '@/components/ModelSelector'

export function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [requirement, setRequirement] = useState('')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [models, setModels] = useState<OllamaModel[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('deepseek-r1:14b')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (id) {
      loadProject()
      loadModels()
    }
  }, [id])

  const loadProject = async () => {
    try {
      const projectData = await api.getProject(id!)
      setProject(projectData)
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

  const handleGenerateStories = async () => {
    if (!requirement.trim() || !project) return

    setGenerating(true)
    try {
      const content = await api.generateStories(project.id, requirement, selectedModel)
      setGeneratedContent(content)
    } catch (error) {
      console.error('Failed to generate stories:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleConfirmStories = async (stories: any[], features: any[]) => {
    if (!project) return

    try {
      await api.confirmStories(project.id, stories, features)
      setGeneratedContent(null)
      setRequirement('')
      alert('Stories confirmed and pushed to Azure DevOps!')
    } catch (error) {
      console.error('Failed to confirm stories:', error)
      alert('Failed to confirm stories. Please try again.')
    }
  }

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
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
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
        
        <ModelSelector
          models={models}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ContextUpload 
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
                className="min-h-[120px]"
              />
              <Button 
                onClick={handleGenerateStories}
                disabled={!requirement.trim() || generating}
                className="w-full"
              >
                {generating ? 'Generating...' : 'Generate Stories'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          {generatedContent ? (
            <GeneratedStoriesPanel
              content={generatedContent}
              onConfirm={handleConfirmStories}
              onEdit={setGeneratedContent}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generated stories will appear here</p>
                  <p className="text-sm mt-1">Enter a requirement and click Generate Stories</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}