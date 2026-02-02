import { createAPIClient } from '@studytree/shared'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8001'

export const apiClient = createAPIClient(API_URL, FASTAPI_URL)

// Token persistence
const TOKEN_STORAGE_KEY = 'studytree_tokens'

export const saveTokens = (tokens: { access: string; refresh: string }) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
  apiClient.setTokens(tokens)
}

export const loadTokens = () => {
  const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (stored) {
    const tokens = JSON.parse(stored)
    apiClient.setTokens(tokens)
    return tokens
  }
  return null
}

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  apiClient.clearTokens()
}

// Initialize tokens on load
loadTokens()
