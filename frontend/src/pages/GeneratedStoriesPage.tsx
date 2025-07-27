import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GeneratedContent } from '@/types'
import { GeneratedStoriesPanel } from '@/components/GeneratedStoriesPanel'
import { api } from '@/services/api'
import { ActivityLog } from '@/components/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export function GeneratedStoriesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false)
  
  // Socket activity log
  const { activities, isProcessing } = useActivityLog(id || '')

  useEffect(() => {
    // Try to load generated content from session storage
    const storedContent = sessionStorage.getItem(`generatedContent-${id}`)
    console.log('Retrieved content from session storage:', { id, storedContent })
    
    if (storedContent) {
      try {
        const parsedContent = JSON.parse(storedContent)
        console.log('Parsed content:', parsedContent)
        setContent(parsedContent)
      } catch (error) {
        console.error('Error parsing content from session storage:', error)
        // If there's an error parsing the content, don't redirect
        alert('Error loading generated stories. Please try generating them again.')
      }
    } else {
      // If there's no generated content in storage, redirect back to the project page
      console.log('No content found in session storage, redirecting back to project page')
      navigate(`/project/${id}`)
    }
    setLoading(false)
  }, [id, navigate])

  const handleConfirmStories = async (stories: any[], features: any[]) => {
    if (!id) return

    try {
      await api.confirmStories(id, stories, features)
      // Clear the stored content after confirming
      sessionStorage.removeItem(`generatedContent-${id}`)
      alert('Stories confirmed and pushed to Azure DevOps!')
      // Navigate back to the project page
      navigate(`/project/${id}`)
    } catch (error) {
      console.error('Failed to confirm stories:', error)
      alert('Failed to confirm stories. Please try again.')
    }
  }

  const handleBackToRequirement = () => {
    navigate(`/project/${id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading generated stories...</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Generated Content</h2>
          <p className="text-muted-foreground mb-4">There are no generated stories to display.</p>
          <Button onClick={() => navigate(`/project/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={handleBackToRequirement}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requirement
        </Button>
        <h1 className="text-2xl font-bold ml-4">Generated Stories</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <GeneratedStoriesPanel
          content={content}
          onConfirm={handleConfirmStories}
          onEdit={setContent}
        />
        
        {/* Activity Log Section */}
        <div className="mt-8">
          <Collapsible
            open={isActivityLogOpen}
            onOpenChange={setIsActivityLogOpen}
            className="border rounded-lg overflow-hidden"
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Generation Activity Log</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {isActivityLogOpen ? 'Hide Details' : 'Show Details'}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ActivityLog 
                activities={activities} 
                isProcessing={isProcessing} 
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}
