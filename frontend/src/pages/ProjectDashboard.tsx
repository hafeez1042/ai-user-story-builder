import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Folder, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/services/api'
import { Project } from '@/types'
import { formatDate } from '@/lib/utils'

export function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const navigate = useNavigate()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await api.getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return

    setCreating(true)
    try {
      const project = await api.createProject(newProject)
      setProjects(prev => [project, ...prev])
      setNewProject({ name: '', description: '' })
      setDialogOpen(false)
      navigate(`/project/${project.id}`)
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Story Builder v3</h1>
          <p className="text-muted-foreground mt-1">
            Streamline manual user-story creation for project management
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Start a new project to begin generating user stories.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Name *</label>
                <Input
                  placeholder="Enter project name..."
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Enter project description..."
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProject} 
                disabled={!newProject.name.trim() || creating}
              >
                {creating ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first project to start generating user stories.
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Project
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleProjectClick(project.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  {project.name}
                </CardTitle>
                {project.description && (
                  <CardDescription>{project.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Created {formatDate(project.createdAt)}
                </div>
                {project.contextFiles.length > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {project.contextFiles.length} context file{project.contextFiles.length !== 1 ? 's' : ''}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}