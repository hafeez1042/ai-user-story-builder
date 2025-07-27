# Story Builder v3

A full-stack web application for streamlined manual user-story creation for project management. This application integrates with Azure DevOps and uses local Ollama models for AI-powered story generation.

## Features

- **Project Management**: Create and manage multiple projects
- **Context Upload**: Upload PDF, DOCX, and Markdown files to provide context
- **AI-Powered Generation**: Use local Ollama models to generate user stories
- **Story Editing**: Edit, delete, split, and merge generated stories
- **Azure DevOps Integration**: Automatically push confirmed stories to Azure DevOps
- **Local Storage**: All data persisted as UTF-8 Markdown files

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Vite for development

### Backend
- Express + TypeScript
- Local file system storage
- Ollama integration for AI models
- Azure DevOps API integration
- Multer for file uploads

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Ollama** installed and running locally
3. **Azure DevOps** account (optional, for work item integration)

### Installing Ollama

Visit [ollama.ai](https://ollama.ai) and follow the installation instructions for your platform.

After installation, pull the default model:
```bash
ollama pull deepseek-r1:14b
```

## Installation

### Quick Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd story-builder-v3
```

2. Run the setup script:
```bash
npm run setup
```

This will:
- Install all dependencies for both workspaces
- Create environment file from template
- Check system requirements (Node.js, Ollama)
- Provide next steps

### Manual Setup

If you prefer manual installation:

1. Install all dependencies (using npm workspaces):
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your Azure DevOps settings (optional):
```env
AZURE_DEVOPS_URL=https://dev.azure.com/yourorganization
AZURE_DEVOPS_PAT=your_personal_access_token
AZURE_DEVOPS_PROJECT=your_project_name
AZURE_DEVOPS_TEAM=your_team_name
```

## Development

Start both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend development server on http://localhost:3000

### Individual Scripts

Backend only:
```bash
npm run dev:backend
```

Frontend only:
```bash
npm run dev:frontend
```

### Workspace Commands

Install dependencies for all workspaces:
```bash
npm install
```

Run scripts across all workspaces:
```bash
npm run test          # Run tests in all workspaces
npm run lint          # Run linting in all workspaces
npm run typecheck     # Run type checking in all workspaces
npm run clean         # Clean build artifacts in all workspaces
```

Run commands in specific workspace:
```bash
npm run dev --workspace=backend
npm run build --workspace=frontend
```

## Production Build

Build both frontend and backend:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Usage

1. **Create a Project**: Start by creating a new project from the dashboard
2. **Upload Context** (Optional): Upload relevant documents to provide context for story generation
3. **Enter Requirements**: Type your requirement in the text area
4. **Generate Stories**: Click "Generate Stories" to create user stories using AI
5. **Review & Edit**: Edit the generated stories as needed
6. **Confirm**: Click "Confirm & Push to Azure DevOps" to save and optionally push to Azure DevOps

## File Structure

```
story-builder-v3/
├── backend/
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   └── index.ts      # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   ├── types/        # TypeScript types
│   │   └── main.tsx      # App entry point
│   └── package.json
├── data/                 # Local storage directory
└── package.json          # Root package.json
```

## API Endpoints

- `POST /api/projects` - Create new project
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects/:id/context` - Upload context files
- `POST /api/projects/:id/requirement` - Generate stories from requirement
- `PUT /api/projects/:id/confirmed` - Confirm and push stories
- `GET /api/models` - List available Ollama models

## Configuration

### Ollama Models

By default, the application uses `deepseek-r1:14b`. You can install additional models:

```bash
ollama pull llama2
ollama pull codellama
ollama pull mistral
```

### Azure DevOps Setup

1. Create a Personal Access Token (PAT) in Azure DevOps
2. Ensure the PAT has permissions for "Work Items (Read & Write)"
3. Add your organization URL, PAT, and project name to the `.env` file

## Troubleshooting

### Ollama Connection Issues
- Ensure Ollama is running: `ollama serve`
- Check if models are installed: `ollama list`
- Verify the base URL in environment variables

### Azure DevOps Integration
- Verify your PAT has correct permissions
- Check that the project name matches exactly
- Ensure your organization URL is correct

### File Upload Issues
- Supported formats: PDF, DOCX, Markdown, Plain Text
- Check file permissions in the uploads directory
- Verify multer configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[MIT License](LICENSE)