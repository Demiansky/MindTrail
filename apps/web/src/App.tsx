import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import TreeList from './pages/TreeList'
import TreeEditor from './pages/TreeEditor'
import { loadTokens } from './api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const tokens = loadTokens()
    setIsAuthenticated(!!tokens)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/trees" /> : <Login onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/trees" 
          element={
            isAuthenticated ? <TreeList onLogout={handleLogout} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/trees/:treeId" 
          element={
            isAuthenticated ? <TreeEditor onLogout={handleLogout} /> : <Navigate to="/login" />
          } 
        />
        <Route path="/" element={<Navigate to="/trees" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
