import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { OllamaModel } from '@/types'

interface ModelSelectorProps {
  models: OllamaModel[]
  selectedModel: string
  onModelChange: (model: string) => void
}

export function ModelSelector({ models, selectedModel, onModelChange }: ModelSelectorProps) {
  const formatModelSize = (size: number) => {
    const gb = size / (1024 * 1024 * 1024)
    return `${gb.toFixed(1)}B`
  }

  const getDisplayName = (modelName: string) => {
    return modelName.replace(/:/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Model: {getDisplayName(selectedModel)}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select AI Model</DialogTitle>
          <DialogDescription>
            Choose the Ollama model to use for generating user stories
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {models.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No models available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Make sure Ollama is running and has models installed
              </p>
            </div>
          ) : (
            models.map((model) => (
              <Card 
                key={model.name}
                className={`cursor-pointer transition-colors ${
                  selectedModel === model.name 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onModelChange(model.name)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {getDisplayName(model.name)}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {formatModelSize(model.size)}
                      </span>
                      {selectedModel === model.name && (
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs">
                    Modified: {new Date(model.modified_at).toLocaleDateString()}
                  </CardDescription>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        {models.length === 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              To install models, run: <code className="bg-muted px-1 rounded">ollama pull deepseek-r1:14b</code>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}