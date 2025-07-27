import { useState, useRef } from 'react'
import { Upload, File, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/services/api'
import { Project } from '@/types'
import { formatFileSize } from '@/lib/utils'

interface ContextUploadProps {
  project: Project
  onContextUploaded: (updatedProject: Project) => void
}

export function ContextUpload({ project, onContextUploaded }: ContextUploadProps) {
  const [uploading, setUploading] = useState(false)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Context Upload
        </CardTitle>
        <CardDescription>
          Upload PDFs, DOCX, or Markdown files to provide context for story generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Uploading...</span>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here, or click to select
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
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
            <h4 className="text-sm font-medium">Uploaded Files</h4>
            {project.contextFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
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
                  onClick={() => removeContextFile(file.id)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}