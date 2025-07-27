import { useState, useRef } from 'react'
import { Upload, File, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/services/api'
import { Project } from '@/types'
import { formatFileSize } from '@/lib/utils'

interface CompactContextUploadProps {
  project: Project
  onContextUploaded: (updatedProject: Project) => void
}

export function CompactContextUpload({ project, onContextUploaded }: CompactContextUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = async (files: FileList) => {
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
      'text/plain'
    ]

    const validFiles = Array.from(files).filter(file => 
      supportedTypes.includes(file.type)
    )

    if (validFiles.length === 0) {
      alert('Please select supported file types: PDF, DOCX, Markdown, or plain text files')
      return
    }

    setUploading(true)
    try {
      const fileList = new DataTransfer()
      validFiles.forEach(file => fileList.items.add(file))

      await api.uploadContext(project.id, fileList.files)
      
      const updatedProject = await api.getProject(project.id)
      onContextUploaded(updatedProject)
    } catch (error) {
      console.error('Failed to upload files:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeContextFile = async (fileId: string) => {
    try {
      const updatedFiles = project.contextFiles.filter(f => f.id !== fileId)
      const updatedProject = { ...project, contextFiles: updatedFiles }
      onContextUploaded(updatedProject)
    } catch (error) {
      console.error('Failed to remove file:', error)
    }
  }

  const openFile = (filePath: string) => {
    // Implement file viewing logic here
    window.open(`/api/files/${filePath}`, '_blank')
  }

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div 
          className="flex items-center justify-between cursor-pointer" 
          onClick={toggleExpand}
        >
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="font-medium">Context Files</span>
            <span className="bg-muted text-muted-foreground text-xs rounded-full px-2 py-0.5">
              {project.contextFiles.length || 0}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {uploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm">Uploading...</span>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground mb-2">
                    Drag and drop files here, or click to select
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                    disabled={uploading}
                  >
                    Select Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.md,.txt"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </>
              )}
            </div>

            {project.contextFiles.length > 0 && (
              <div className="space-y-2">
                {project.contextFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                    <div 
                      className="flex items-center gap-2 flex-1 cursor-pointer hover:text-primary" 
                      onClick={(e) => {
                        e.stopPropagation()
                        openFile(file.path)
                      }}
                    >
                      <File className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{file.originalName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeContextFile(file.id)
                      }}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
