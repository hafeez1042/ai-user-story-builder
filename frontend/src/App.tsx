import { Routes, Route } from 'react-router-dom'
import { ProjectDashboard } from './pages/ProjectDashboard'
import { ProjectWorkspace } from './pages/ProjectWorkspace'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<ProjectDashboard />} />
        <Route path="/project/:id" element={<ProjectWorkspace />} />
      </Routes>
    </div>
  )
}

export default App