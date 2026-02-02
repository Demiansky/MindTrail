import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiClient, clearTokens } from '../api'
import type { TreeDTO, CreateTreeRequest } from '@studytree/shared'

interface TreeListProps {
  onLogout: () => void
}

export default function TreeList({ onLogout }: TreeListProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTreeTitle, setNewTreeTitle] = useState('')

  const { data: trees, isLoading } = useQuery({
    queryKey: ['trees'],
    queryFn: () => apiClient.listTrees(),
  })

  const createTreeMutation = useMutation({
    mutationFn: (data: CreateTreeRequest) => apiClient.createTree(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] })
      setShowCreateForm(false)
      setNewTreeTitle('')
    },
  })

  const handleLogout = () => {
    clearTokens()
    onLogout()
  }

  const handleCreateTree = (e: React.FormEvent) => {
    e.preventDefault()
    createTreeMutation.mutate({ title: newTreeTitle, visibility: 'private' })
  }

  return (
    <div>
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Study Trees</h1>
          <button onClick={handleLogout} className="secondary">Logout</button>
        </div>
      </div>

      <div className="container">
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>My Trees</h2>
          <button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Create New Tree'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateTree} style={{ marginBottom: '2rem', maxWidth: '400px' }}>
            <div className="form-group">
              <label htmlFor="title">Tree Title</label>
              <input
                id="title"
                type="text"
                value={newTreeTitle}
                onChange={(e) => setNewTreeTitle(e.target.value)}
                placeholder="e.g., Machine Learning Fundamentals"
                required
                autoFocus
              />
            </div>
            <button type="submit" disabled={createTreeMutation.isPending}>
              {createTreeMutation.isPending ? 'Creating...' : 'Create Tree'}
            </button>
          </form>
        )}

        {isLoading && <div className="loading">Loading trees...</div>}

        {trees && trees.length === 0 && (
          <p style={{ color: '#666' }}>No trees yet. Create your first study tree!</p>
        )}

        {trees && trees.length > 0 && (
          <div className="tree-list">
            {trees.map((tree: TreeDTO) => (
              <div
                key={tree.id}
                className="tree-card"
                onClick={() => navigate(`/trees/${tree.id}`)}
              >
                <h3>{tree.title}</h3>
                <p>{tree.node_count} nodes • {tree.visibility}</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Created {new Date(tree.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
