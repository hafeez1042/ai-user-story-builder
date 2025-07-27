import { useState } from 'react'
import { Edit2, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GeneratedContent, UserStory, Feature } from '@/types'

interface GeneratedStoriesPanelProps {
  content: GeneratedContent
  onConfirm: (stories: UserStory[], features: Feature[]) => void
  onEdit: (content: GeneratedContent) => void
}

export function GeneratedStoriesPanel({ content, onConfirm, onEdit }: GeneratedStoriesPanelProps) {
  const [editingStory, setEditingStory] = useState<string | null>(null)
  const [editingFeature, setEditingFeature] = useState<string | null>(null)
  const [storyEdits, setStoryEdits] = useState<Record<string, UserStory>>({})
  const [featureEdits, setFeatureEdits] = useState<Record<string, Feature>>({})

  const handleEditStory = (story: UserStory) => {
    setEditingStory(story.id)
    setStoryEdits({ ...storyEdits, [story.id]: { ...story } })
  }

  const handleEditFeature = (feature: Feature) => {
    setEditingFeature(feature.id)
    setFeatureEdits({ ...featureEdits, [feature.id]: { ...feature } })
  }

  const handleSaveStory = (storyId: string) => {
    const updatedStory = storyEdits[storyId]
    if (updatedStory) {
      const updatedStories = content.userStories.map(story =>
        story.id === storyId ? updatedStory : story
      )
      onEdit({ ...content, userStories: updatedStories })
    }
    setEditingStory(null)
  }

  const handleSaveFeature = (featureId: string) => {
    const updatedFeature = featureEdits[featureId]
    if (updatedFeature) {
      const updatedFeatures = content.features.map(feature =>
        feature.id === featureId ? updatedFeature : feature
      )
      onEdit({ ...content, features: updatedFeatures })
    }
    setEditingFeature(null)
  }

  const handleDeleteStory = (storyId: string) => {
    const updatedStories = content.userStories.filter(story => story.id !== storyId)
    onEdit({ ...content, userStories: updatedStories })
  }

  const handleDeleteFeature = (featureId: string) => {
    const updatedFeatures = content.features.filter(feature => feature.id !== featureId)
    onEdit({ ...content, features: updatedFeatures })
  }

  const handleConfirm = () => {
    onConfirm(content.userStories, content.features)
  }

  const updateStoryEdit = (storyId: string, field: keyof UserStory, value: any) => {
    setStoryEdits({
      ...storyEdits,
      [storyId]: {
        ...storyEdits[storyId],
        [field]: value
      }
    })
  }

  const updateFeatureEdit = (featureId: string, field: keyof Feature, value: any) => {
    setFeatureEdits({
      ...featureEdits,
      [featureId]: {
        ...featureEdits[featureId],
        [field]: value
      }
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50'
      case 'High': return 'text-orange-600 bg-orange-50'
      case 'Medium': return 'text-yellow-600 bg-yellow-50'
      case 'Low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Stories</CardTitle>
        <CardDescription>
          Review, edit, and confirm the generated user stories and features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {content.features.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>
            {content.features.map((feature) => (
              <Card key={feature.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    {editingFeature === feature.id ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={featureEdits[feature.id]?.title || ''}
                          onChange={(e) => updateFeatureEdit(feature.id, 'title', e.target.value)}
                          className="font-semibold"
                        />
                        <Textarea
                          value={featureEdits[feature.id]?.description || ''}
                          onChange={(e) => updateFeatureEdit(feature.id, 'description', e.target.value)}
                          className="min-h-[60px]"
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <CardTitle className="text-base">{feature.title}</CardTitle>
                        <CardDescription className="mt-1">{feature.description}</CardDescription>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {editingFeature === feature.id ? (
                        <Button
                          size="sm"
                          onClick={() => handleSaveFeature(feature.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditFeature(feature)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteFeature(feature.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">User Stories</h3>
          {content.userStories.map((story) => (
            <Card key={story.id} className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  {editingStory === story.id ? (
                    <div className="flex-1 space-y-3">
                      <Input
                        value={storyEdits[story.id]?.title || ''}
                        onChange={(e) => updateStoryEdit(story.id, 'title', e.target.value)}
                        className="font-semibold"
                      />
                      <Textarea
                        value={storyEdits[story.id]?.description || ''}
                        onChange={(e) => updateStoryEdit(story.id, 'description', e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={storyEdits[story.id]?.priority || 'Medium'}
                          onChange={(e) => updateStoryEdit(story.id, 'priority', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                        <Input
                          type="number"
                          min="1"
                          max="13"
                          value={storyEdits[story.id]?.storyPoints || ''}
                          onChange={(e) => updateStoryEdit(story.id, 'storyPoints', parseInt(e.target.value) || undefined)}
                          placeholder="Story Points"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <CardTitle className="text-base">{story.title}</CardTitle>
                      <CardDescription className="mt-2 whitespace-pre-wrap">
                        {story.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(story.priority)}`}>
                          {story.priority}
                        </span>
                        {story.storyPoints && (
                          <span className="text-sm font-medium text-muted-foreground">
                            {story.storyPoints} points
                          </span>
                        )}
                      </div>
                      {story.acceptanceCriteria.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-2">Acceptance Criteria:</h5>
                          <ul className="text-sm space-y-1">
                            {story.acceptanceCriteria.map((criteria, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-muted-foreground">•</span>
                                <span>{criteria}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {editingStory === story.id ? (
                      <Button
                        size="sm"
                        onClick={() => handleSaveStory(story.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditStory(story)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteStory(story.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleConfirm} className="px-8">
            Confirm & Push to Azure DevOps
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}