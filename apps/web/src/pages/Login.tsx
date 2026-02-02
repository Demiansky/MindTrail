import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiClient, saveTokens } from '../api'

interface LoginProps {
  onLogin: () => void
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation({
    mutationFn: async () => {
      const tokens = await apiClient.login({ username, password })
      return tokens
    },
    onSuccess: (tokens) => {
      saveTokens(tokens)
      onLogin()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate()
  }

  return (
    <div className="container">
      <div className="form">
        <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Study Tree</h1>
        <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Login</h2>
        
        {loginMutation.isError && (
          <div className="error">
            Invalid credentials. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loginMutation.isPending} style={{ width: '100%' }}>
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: '1rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
          Demo: Create a superuser using Django admin commands
        </p>
      </div>
    </div>
  )
}
