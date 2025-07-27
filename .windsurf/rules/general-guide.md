---
trigger: always_on
---

# Story Builder v3 - Windsurf Instructions

## Project Overview

Story Builder v3 is a full-stack web application designed for streamlined user-story creation in project management. It integrates with Azure DevOps and leverages local Ollama AI models for story generation.

### Key Features

- **Project Management**: Create and manage multiple projects
- **Context Upload**: Upload PDF, DOCX, and Markdown files to provide context
- **AI-Powered Generation**: Use local Ollama models to generate user stories
- **Story Editing**: Edit, delete, split, and merge generated stories
- **Azure DevOps Integration**: Automatically push confirmed stories to Azure DevOps
- **Local Storage**: All data persisted as UTF-8 Markdown files

## Technical Architecture

### Project Structure

```
story-builder-v3/
├── backend/               # Express + TypeScript backend
│   ├── src/
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # Core business logic services
│   │   ├── types/         # TypeScript type definitions
│   │   └── index.ts       # Server entry point
│   └── package.json       # Backend dependencies
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── services/      # API client services
│   │   └── main.tsx       # Frontend entry point
│   └── package.json       # Frontend dependencies
├── data/                  # Local storage directory for projects
├── scripts/               # Utility scripts
└── package.json           # Root package with workspace configuration
```

### Technology Stack

#### Frontend
- React 19 with TypeScript
- React Router for navigation
- Radix UI components with TailwindCSS v4
- Vite for development and build

#### Backend
- Express.js with TypeScript
- Multer for file upload handling
- Langchain for AI integration
- Azure DevOps Node API for work item integration
- PDF.js, Mammoth for document processing

## Development Setup Instructions

### Prerequisites

1. **Node.js** (v18 or higher) - The application is built on Node.js
2. **Ollama** - Local AI model server for story generation
3. **Azure DevOps Account** (optional) - For work item integration

### Installing Ollama

1. Visit [ollama.ai](https://ollama.ai) and download the installer for your platform
2. Install and start the Ollama service
3. Pull the default model:
   ```bash
   ollama pull deepseek-r1:14b
   ```

### Environment Setup

1. Clone the repository
2. Create environment configuration:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` file to configure Azure DevOps integration (if needed):
   ```
   AZURE_DEVOPS_URL=https://dev.azure.com/yourorganization
   AZURE_DEVOPS_PAT=your_personal_access_token
   AZURE_DEVOPS_PROJECT=your_project_name
   AZURE_DEVOPS_TEAM=your_team_name
   ```

### Installing Dependencies

The project uses npm workspaces to manage dependencies across frontend and backend:

```bash
npm install
```

This command installs all dependencies for both the frontend and backend packages.

### Development Workflow

1. Start the development servers:
   ```bash
   npm run dev
   ```
   This runs both frontend and backend in development mode:
   - Backend on http://localhost:4000
   - Frontend on http://localhost:3000 (after backend starts)

2. For individual workspace development:
   ```bash
   npm run dev:backend    # Run only the backend
   npm run dev:frontend   # Run only the frontend
   ```

### Building for Production

1. Create production builds:
   ```bash
   npm run build
   ```
   This builds both frontend and backend packages.

2. Start the production server:
   ```bash
   npm start
   ```
   This serves the built frontend from the backend server.

## Application Modules and Workflows

### Backend Services

1. **DocumentProcessor** - Extracts and processes text from uploaded files
2. **StoryGenerator** - Uses Ollama to generate user stories based on requirements
3. **FileStorage** - Manages local data storage for projects and stories
4. **AzureDevOps** - Handles integration with Azure DevOps for work item creation
5. **Ollama** - Service for interacting with local Ollama AI models

### Frontend Components

1. **ProjectDashboard** - Lists available projects and allows creation of new ones
2. **ProjectWorkspace** - Main workspace for story generation and management
3. **ContextUpload** - Handles uploading and processing of context documents
4. **GeneratedStoriesPanel** - Displays and enables editing of generated stories
5. **ModelSelector** - Allows selection of different Ollama models

### User Workflow

1. **Project Creation**: Users create a new project from the dashboard
2. **Context Upload**: Optional step to provide background information through documents
3. **Requirement Input**: Users enter requirements in the text area
4. **Story Generation**: The system uses Ollama AI to generate user stories
5. **Review and Edit**: Users can modify, split, or merge the generated stories
6. **Confirmation**: Stories can be confirmed and optionally pushed to Azure DevOps

## API Endpoints

- `POST /api/projects` - Create a new project
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects/:id/context` - Upload context files
- `POST /api/projects/:id/requirement` - Generate stories from requirement
- `PUT /api/projects/:id/confirmed` - Confirm and push stories
- `GET /api/models` - List available Ollama models

## Troubleshooting

### Ollama Connection Issues
- Ensure Ollama is running with `ollama serve`
- Verify model availability with `ollama list`
- Check for firewall restrictions that might block local connections

### Azure DevOps Integration Problems
- Verify that the PAT token has sufficient permissions (Work Items Read & Write)
- Ensure organization URL, project name, and team name are correctly specified
- Check network connectivity to Azure DevOps services

### File Upload Issues
- Verify supported formats (PDF, DOCX, Markdown)
- Check file size limits (default multer configuration)
- Ensure the uploads directory has proper write permissions

## Development Guidelines

### Adding a New AI Model

1. Install the model through Ollama:
   ```bash
   ollama pull [model-name]
   ```

2. The model will automatically appear in the ModelSelector component

### Extending Document Processing

1. Add support for new file types in `backend/src/services/documentProcessor.ts`
2. Implement a new processor function for the specific file type
3. Update the file type detection logic

### Adding New Azure DevOps Work Item Types

1. Modify `backend/src/services/azureDevOps.ts`
2. Add the new work item type template
3. Update the story confirmation process to handle the new type

## Deployment Considerations

### Production Deployment

1. Ensure Node.js v18+ is installed on the server
2. Clone the repository and install dependencies
3. Build the project with `npm run build`
4. Configure environment variables for production
5. Start the server with `npm start` or use a process manager like PM2

### Docker Deployment

While not included by default, the application can be containerized:

1. Create appropriate Dockerfiles for frontend and backend
2. Configure Docker Compose for local development
3. Ensure volume mapping for data persistence
4. Configure Ollama access from within containers

## Future Development Roadmap

1. **Enhanced Editing Features** - More advanced story editing capabilities
2. **Additional Integrations** - Support for Jira, GitHub Issues, etc.
3. **Collaborative Editing** - Real-time collaboration on story editing
4. **Custom Templates** - User-defined templates for story generation
5. **Advanced Analytics** - Metrics and analytics on story quality and usage
