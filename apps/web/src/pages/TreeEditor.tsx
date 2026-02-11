import type { CreateNodeRequest, NodeDTO } from '@studytree/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient, clearTokens } from '../api'

interface TreeEditorProps {
  onLogout: () => void
}

export default function TreeEditor({ onLogout }: TreeEditorProps) {
  const { treeId } = useParams<{ treeId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null)
  const [aiResponse, setAiResponse] = useState<string>('')
  const [isLoadingAI, setIsLoadingAI] = useState(false)

  const [localNotes, setLocalNotes] = useState('');

  // Sync localNotes with selectedNode's user_notes whenever selectedNode changes

  const { data: tree } = useQuery({
    queryKey: ['tree', treeId],
    queryFn: () => apiClient.getTree(Number(treeId)),
    enabled: !!treeId,
  })

  const { data: nodes } = useQuery({
    queryKey: ['tree-nodes', treeId],
    queryFn: () => apiClient.getTreeNodes(Number(treeId)),
    enabled: !!treeId,
  })

  // Recursively find a node by ID in the nested structure
  const findNodeById = (nodes: NodeDTO[] | undefined, id: number): NodeDTO | undefined => {
    if (!nodes) return undefined
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children && Array.isArray(node.children)) {
        const found = findNodeById(node.children as NodeDTO[], id)
        if (found) return found
      }
    }
    return undefined
  }

  const selectedNode = findNodeById(nodes, selectedNodeId!)

  const createNodeMutation = useMutation({
    mutationFn: (data: CreateNodeRequest) => apiClient.createNode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tree-nodes', treeId] })
    },
  })

  const updateNodeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.updateNode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tree-nodes', treeId] })
    },
  })

  useEffect(() => {
    setLocalNotes(selectedNode?.user_notes || '');
  }, [selectedNode]);

  const handleLogout = () => {
    clearTokens()
    onLogout()
  }

  const handleCreateNode = () => {
    const title = prompt('Enter node title:')
    if (title) {
      createNodeMutation.mutate({
        tree: Number(treeId),
        parent: selectedNodeId || undefined,
        title,
        user_notes: '',
      })
    }
  }

  const handleUpdateNotes = (notes: string) => {
    if (selectedNodeId) {
      updateNodeMutation.mutate({
        id: selectedNodeId,
        data: { user_notes: notes },
      })
    }
  }

  const handleAIAction = async (action: 'explain' | 'quiz' | 'summarize') => {
    if (!selectedNodeId) return

    setIsLoadingAI(true)
    setAiResponse('')

    try {
      let response
      if (action === 'explain') {
        response = await apiClient.explainNode(selectedNodeId)
      } else if (action === 'quiz') {
        response = await apiClient.quizNode(selectedNodeId)
      } else {
        response = await apiClient.summarizeNode(selectedNodeId)
      }
      setAiResponse(response.response)
    } catch (error) {
      setAiResponse('Error generating AI response. Please try again.')
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleSaveAIToNode = () => {
    if (selectedNodeId && aiResponse) {
      const currentNotes = selectedNode?.ai_notes || ''
      const newNotes = currentNotes + '\n\n' + aiResponse
      updateNodeMutation.mutate({
        id: selectedNodeId,
        data: { ai_notes: newNotes.trim() },
      })
      setAiResponse('')
    }
  }

  const renderNode = (node: NodeDTO, level = 0) => {
    const children = node.children || []
  //  console.log('Children of', node.title, ':', children) // Diagnostic
    return (
      <div key={node.id}>
        <div
          className={`node-item ${selectedNodeId === node.id ? 'selected' : ''}`}
          style={{ marginLeft: `${level * 1}rem` }}
          onClick={() => setSelectedNodeId(node.id)}
        >
          {node.title}
        </div>
        {children.map((child: NodeDTO) => renderNode(child, level + 1))}
      </div>
    )
  }

  return (
    <div>
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button onClick={() => navigate('/trees')} className="secondary">← Back</button>
            <span style={{ marginLeft: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {tree?.title}
            </span>
          </div>
          <button onClick={handleLogout} className="secondary">Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="tree-editor">
          <div className="tree-panel">
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <h3>Nodes</h3>
              <button onClick={handleCreateNode}>+ Add</button>
            </div>
            {nodes && nodes.filter((n: NodeDTO) => !n.parent).map((node: NodeDTO) => renderNode(node))}
            {nodes && nodes.length === 0 && (
              <p style={{ color: '#666', fontSize: '0.9rem' }}>No nodes yet. Click Add to create one.</p>
            )}
          </div>

          <div className="node-editor">
            {selectedNode ? (
              <>
                <h2>{selectedNode.title}</h2>
                
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Your Notes</label>
                  <textarea
                    value={localNotes}
                    onChange={e => setLocalNotes(e.target.value)}
                    onBlur={() => handleUpdateNotes(localNotes)}
                   // onChange={(e) => handleUpdateNotes(e.target.value)}
                    placeholder="Write your notes here..."
                  />
                </div>

                {selectedNode.ai_notes && (
                  <div className="form-group">
                    <label>AI Notes</label>
                    <div style={{ 
                      padding: '1rem', 
                      background: '#f8f9fa', 
                      borderRadius: '4px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {selectedNode.ai_notes}
                    </div>
                  </div>
                )}

                <div className="ai-panel">
                  <h3>AI Assistant</h3>
                  <div className="ai-buttons">
                    <button onClick={() => handleAIAction('explain')} disabled={isLoadingAI}>
                      Explain
                    </button>
                    <button onClick={() => handleAIAction('quiz')} disabled={isLoadingAI}>
                      Quiz
                    </button>
                    <button onClick={() => handleAIAction('summarize')} disabled={isLoadingAI}>
                      Summarize
                    </button>
                  </div>

                  {isLoadingAI && <div className="loading">Generating AI response...</div>}

                  {aiResponse && (
                    <>
                      <div className="ai-response">{aiResponse}</div>
                      <button 
                        onClick={handleSaveAIToNode} 
                        style={{ marginTop: '1rem' }}
                      >
                        Save to AI Notes
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="loading">Select a node to view and edit</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
