import { useState } from 'react';
import { ChevronDown, ChevronUp, Terminal, Code, Info, Loader, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';
import { ActivityLogEvent } from '@/hooks/useActivityLog';
import { Input } from '@/components/ui/input';
import { UserStory, Feature } from '@/types';

interface ActivityLogProps {
  activities: ActivityLogEvent[];
  isProcessing: boolean;
  onRemoveFeature?: (featureId: string) => void;
  onRemoveStory?: (storyId: string) => void;
  onEditStory?: (storyId: string, updatedStory: Partial<any>) => void;
  onEditFeature?: (featureId: string, updatedFeature: Partial<any>) => void;
}

export function ActivityLog({ activities, isProcessing, onRemoveFeature, onRemoveStory, onEditStory, onEditFeature }: ActivityLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [editedFeatureTitle, setEditedFeatureTitle] = useState('');
  const [editedStoryTitle, setEditedStoryTitle] = useState('');
  const [editedStoryDescription, setEditedStoryDescription] = useState('');

  if (activities.length === 0 && !isProcessing) {
    return null;
  }

  const getIconForType = (type: ActivityLogEvent['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'prompt':
        return <Code className="h-4 w-4 text-purple-500" />;
      case 'response':
        return <Code className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const handleEditFeature = (feature: any) => {
    setEditingFeatureId(feature.id);
    setEditedFeatureTitle(feature.title);
  };

  const handleSaveFeatureEdit = (featureId: string) => {
    if (onEditFeature) {
      onEditFeature(featureId, { title: editedFeatureTitle });
    }
    setEditingFeatureId(null);
  };

  const handleEditStory = (story: any) => {
    setEditingStoryId(story.id);
    setEditedStoryTitle(story.title);
    setEditedStoryDescription(story.description);
  };

  const handleSaveStoryEdit = (storyId: string) => {
    if (onEditStory) {
      onEditStory(storyId, { title: editedStoryTitle, description: editedStoryDescription });
    }
    setEditingStoryId(null);
  };

  return (
    <Card className="mt-4 border-t-2 border-primary">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              <h3 className="text-sm font-medium">Activity Details</h3>
              {isProcessing && (
                <Badge variant="outline" className="animate-pulse bg-yellow-100 text-yellow-800">
                  <Loader className="h-3 w-3 mr-1 animate-spin" />
                  Processing
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="max-h-[300px] overflow-y-auto text-sm space-y-2">
              {activities.map((activity, index) => (
                <div 
                  key={index} 
                  className="py-1 px-2 rounded flex items-start gap-2 hover:bg-muted/50"
                >
                  <div className="mt-0.5">{getIconForType(activity.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{activity.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    {activity.data && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {Object.entries(activity.data).filter(([key]) => !['prompt', 'response', 'stories', 'features'].includes(key)).map(([key, value]) => (
                          <div key={key} className="flex gap-1">
                            <span className="font-medium">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {activity.type === 'prompt' && activity.data?.prompt && (
                      <details className="mt-1" open>
                        <summary className="text-xs font-medium text-purple-600 cursor-pointer">
                          Full Prompt Content
                        </summary>
                        <pre className="text-xs p-2 mt-1 bg-muted overflow-x-auto rounded max-h-[300px]">
                          {activity.data.prompt}
                        </pre>
                      </details>
                    )}
                    
                    {activity.type === 'response' && activity.data?.response && (
                      <details className="mt-1" open>
                        <summary className="text-xs font-medium text-green-600 cursor-pointer">
                          Full Response Content
                        </summary>
                        <pre className="text-xs p-2 mt-1 bg-muted overflow-x-auto rounded max-h-[300px]">
                          {activity.data.response}
                        </pre>
                      </details>
                    )}
                    
                    {activity.type === 'info' && activity.data?.organizedContent && (
                      <div className="mt-2">
                        {/* Features with stories */}
                        {activity.data.organizedContent.features && (
                          <details className="mb-2" open>
                            <summary className="text-xs font-medium text-indigo-600 cursor-pointer flex items-center justify-between">
                              <span>Features with Stories ({activity.data.organizedContent.features.length})</span>
                              <span className="text-xs text-gray-500">[Click to {activity.data.organizedContent.features.length > 0 ? 'hide' : 'show'}]</span>
                            </summary>
                            <div className="text-xs mt-1">
                              {activity.data.organizedContent.features.length > 0 ? (
                                activity.data.organizedContent.features.map((feature: any) => (
                                  <div key={feature.id} className="mb-4 p-3 border border-gray-200 rounded-md">
                                    {editingFeatureId === feature.id ? (
                                      <div className="mb-2">
                                        <Input
                                          value={editedFeatureTitle}
                                          onChange={(e) => setEditedFeatureTitle(e.target.value)}
                                          className="mb-2"
                                        />
                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            onClick={() => handleSaveFeatureEdit(feature.id)}
                                          >
                                            Save
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => setEditingFeatureId(null)}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">{feature.title}</h4>
                                        <div className="flex gap-1">
                                          <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={() => handleEditFeature(feature)}
                                            className="h-6 px-2"
                                          >
                                            Edit
                                          </Button>
                                          {onRemoveFeature && (
                                            <Button 
                                              size="sm" 
                                              variant="ghost" 
                                              onClick={() => onRemoveFeature(feature.id)}
                                              className="h-6 px-2 text-red-600 hover:text-red-700"
                                            >
                                              Remove
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="ml-4">
                                      {feature.userStories.map((story: any) => (
                                        <div key={story.id} className="mb-2 p-2 border border-gray-100 rounded-md">
                                          {editingStoryId === story.id ? (
                                            <div>
                                              <input
                                                value={editedStoryTitle}
                                                onChange={(e) => setEditedStoryTitle(e.target.value)}
                                                className="mb-2"
                                                placeholder="Story title"
                                              />
                                              <input
                                                value={editedStoryDescription}
                                                onChange={(e) => setEditedStoryDescription(e.target.value)}
                                                className="mb-2"
                                                placeholder="Story description"
                                              />
                                              <div className="flex gap-2">
                                                <Button 
                                                  size="sm" 
                                                  onClick={() => handleSaveStoryEdit(story.id)}
                                                >
                                                  Save
                                                </Button>
                                                <Button 
                                                  size="sm" 
                                                  variant="outline" 
                                                  onClick={() => setEditingStoryId(null)}
                                                >
                                                  Cancel
                                                </Button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div>
                                              <div className="flex items-center justify-between">
                                                <div className="font-medium">{story.title}</div>
                                                <div className="flex gap-1">
                                                  <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    onClick={() => handleEditStory(story)}
                                                    className="h-6 px-2"
                                                  >
                                                    Edit
                                                  </Button>
                                                  {onRemoveStory && (
                                                    <Button 
                                                      size="sm" 
                                                      variant="ghost" 
                                                      onClick={() => onRemoveStory(story.id)}
                                                      className="h-6 px-2 text-red-600 hover:text-red-700"
                                                    >
                                                      Remove
                                                    </Button>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="text-sm text-gray-600">{story.description}</div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-500 p-2">No features with stories were generated</div>
                              )}
                            </div>
                          </details>
                        )}
                        
                        {/* Standalone stories */}
                        {activity.data.organizedContent.standaloneStories && (
                          <details className="mb-2" open>
                            <summary className="text-xs font-medium text-blue-600 cursor-pointer flex items-center justify-between">
                              <span>Standalone Stories ({activity.data.organizedContent.standaloneStories.length})</span>
                              <span className="text-xs text-gray-500">[Click to {activity.data.organizedContent.standaloneStories.length > 0 ? 'hide' : 'show'}]</span>
                            </summary>
                            <div className="text-xs mt-1 bg-blue-50 rounded p-2">
                              {activity.data.organizedContent.standaloneStories.length > 0 ? (
                                activity.data.organizedContent.standaloneStories.map((story: any) => (
                                  <div key={story.id} className="mb-2 p-2 border border-blue-100 rounded-md">
                                    {editingStoryId === story.id ? (
                                      <div>
                                        <Input
                                          value={editedStoryTitle}
                                          onChange={(e) => setEditedStoryTitle(e.target.value)}
                                          className="mb-2"
                                          placeholder="Story title"
                                        />
                                        <Input
                                          value={editedStoryDescription}
                                          onChange={(e) => setEditedStoryDescription(e.target.value)}
                                          className="mb-2"
                                          placeholder="Story description"
                                        />
                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            onClick={() => handleSaveStoryEdit(story.id)}
                                          >
                                            Save
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => setEditingStoryId(null)}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="flex items-center justify-between">
                                          <div className="font-medium">{story.title}</div>
                                          <div className="flex gap-1">
                                            <Button 
                                              size="sm" 
                                              variant="ghost" 
                                              onClick={() => handleEditStory(story)}
                                              className="h-6 px-2"
                                            >
                                              Edit
                                            </Button>
                                            {onRemoveStory && (
                                              <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => onRemoveStory(story.id)}
                                                className="h-6 px-2 text-red-600 hover:text-red-700"
                                              >
                                                Remove
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-sm text-gray-600">{story.description}</div>
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-500 p-2">No standalone stories were generated</div>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {activities.length === 0 && isProcessing && (
                <div className="text-center py-4">
                  <Loader className="h-5 w-5 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Waiting for activity...</p>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
