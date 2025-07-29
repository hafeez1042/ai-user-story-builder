import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getConfirmedStories } from '../services/projectService';
import { UserStory } from '../types';

interface ConfirmedStoriesSidebarProps {
  projectId: string;
}

export function ConfirmedStoriesSidebar({ projectId }: ConfirmedStoriesSidebarProps) {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStories();
    }
  }, [isOpen]);

  const fetchStories = async () => {
    try {
      const fetchedStories = await getConfirmedStories(projectId);
      setStories(fetchedStories);
    } catch (error) {
      console.error('Failed to fetch confirmed stories:', error);
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-full bg-background border-l transition-all duration-300 ${isOpen ? 'w-96' : 'w-12'}`}>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="absolute top-1/2 -left-6 transform -translate-y-1/2">
        {isOpen ? <ChevronRight /> : <ChevronLeft />}
      </Button>
      {isOpen && (
        <Card className="h-full overflow-y-auto">
          <CardHeader>
            <CardTitle>Confirmed Stories</CardTitle>
          </CardHeader>
          <CardContent>
            {stories.length > 0 ? (
              <ul>
                {stories.map((story) => (
                  <li key={story.id} className="mb-2 p-2 border rounded">
                    <h4 className="font-semibold">{story.title}</h4>
                    <p className="text-sm text-muted-foreground">{story.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No confirmed stories yet.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
