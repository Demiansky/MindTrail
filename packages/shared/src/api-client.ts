import axios, { AxiosError, AxiosInstance } from 'axios';
import type {
    AIMessageDTO,
    AIRequest,
    AIResponse,
    AuthTokens,
    CreateNodeRequest,
    CreateTreeRequest,
    InviteToTreeRequest,
    LoginRequest,
    NodeDTO,
    TreeDTO,
    TreeMemberDTO,
    UpdateNodeRequest,
    UpdateTreeRequest,
    UserDTO
} from './types';

export class APIClient {
  private api: AxiosInstance;
  private fastapi: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(
    private baseURL: string = 'http://localhost:8000',
    private fastapiURL: string = 'http://localhost:8001'
  ) {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.fastapi = axios.create({
      baseURL: this.fastapiURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    this.fastapi.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Response interceptor for token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshAccessToken();
            return this.api(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            throw refreshError;
          }
        }

        throw error;
      }
    );
  }

  // Token management
  setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.access;
    this.refreshToken = tokens.refresh;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthTokens> {
    const response = await this.api.post<AuthTokens>('/api/auth/token/', credentials);
    this.setTokens(response.data);
    return response.data;
  }

  async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Use a separate axios instance to prevent interceptor from catching this
      const response = await axios.post<AuthTokens>(
        `${this.baseURL}/api/auth/refresh/`,
        { refresh: this.refreshToken }
      );

      this.setTokens(response.data);  // Save both new access AND refresh tokens
      return response.data;
    } catch (error) {
      // If refresh fails, clear tokens and stop retrying
      this.clearTokens();
      throw error;
    }
  }

  async getCurrentUser(): Promise<UserDTO> {
    const response = await this.api.get<UserDTO>('/api/me/');
    return response.data;
  }

  // Tree endpoints
  async listTrees(): Promise<TreeDTO[]> {
    const response = await this.api.get<{ results: TreeDTO[] }>('/api/trees/');
    return response.data.results;
  }

  async getTree(id: number): Promise<TreeDTO> {
    const response = await this.api.get<TreeDTO>(`/api/trees/${id}/`);
    return response.data;
  }

  async createTree(data: CreateTreeRequest): Promise<TreeDTO> {
    const response = await this.api.post<TreeDTO>('/api/trees/', data);
    return response.data;
  }

  async updateTree(id: number, data: UpdateTreeRequest): Promise<TreeDTO> {
    const response = await this.api.patch<TreeDTO>(`/api/trees/${id}/`, data);
    return response.data;
  }

  async deleteTree(id: number): Promise<void> {
    await this.api.delete(`/api/trees/${id}/`);
  }

  async inviteToTree(treeId: number, data: InviteToTreeRequest): Promise<TreeMemberDTO> {
    const response = await this.api.post<TreeMemberDTO>(
      `/api/trees/${treeId}/invite/`,
      data
    );
    return response.data;
  }

  async getTreeNodes(treeId: number): Promise<NodeDTO[]> {
    const response = await this.api.get<NodeDTO[]>(`/api/trees/${treeId}/nodes/`);
    return response.data;
  }

  // Node endpoints
  async getNode(id: number): Promise<NodeDTO> {
    const response = await this.api.get<NodeDTO>(`/api/nodes/${id}/`);
    return response.data;
  }

  async createNode(data: CreateNodeRequest): Promise<NodeDTO> {
    const response = await this.api.post<NodeDTO>('/api/nodes/', data);
    return response.data;
  }

  async updateNode(id: number, data: UpdateNodeRequest): Promise<NodeDTO> {
    const response = await this.api.patch<NodeDTO>(`/api/nodes/${id}/`, data);
    return response.data;
  }

  async deleteNode(id: number): Promise<void> {
    await this.api.delete(`/api/nodes/${id}/`);
  }

  // AI Message endpoints
  async listAIMessages(): Promise<AIMessageDTO[]> {
    const response = await this.api.get<{ results: AIMessageDTO[] }>('/api/ai-messages/');
    return response.data.results;
  }

  async getAIMessage(id: number): Promise<AIMessageDTO> {
    const response = await this.api.get<AIMessageDTO>(`/api/ai-messages/${id}/`);
    return response.data;
  }

  // AI generation endpoints (FastAPI)
  async explainNode(nodeId: number, request: AIRequest = {}): Promise<AIResponse> {
    const response = await this.fastapi.post<AIResponse>(
      `/ai/nodes/${nodeId}/explain`,
      request
    );
    return response.data;
  }

  async quizNode(nodeId: number, request: AIRequest = {}): Promise<AIResponse> {
    const response = await this.fastapi.post<AIResponse>(
      `/ai/nodes/${nodeId}/quiz`,
      request
    );
    return response.data;
  }

  async summarizeNode(nodeId: number, request: AIRequest = {}): Promise<AIResponse> {
    const response = await this.fastapi.post<AIResponse>(
      `/ai/nodes/${nodeId}/summarize`,
      request
    );
    return response.data;
  }

  // Streaming AI (for web)
  async explainNodeStream(
    nodeId: number,
    onChunk: (chunk: string) => void,
    request: AIRequest = {}
  ): Promise<void> {
    await this.streamAI(`/ai/nodes/${nodeId}/explain`, onChunk, {
      ...request,
      stream: true,
    });
  }

  async quizNodeStream(
    nodeId: number,
    onChunk: (chunk: string) => void,
    request: AIRequest = {}
  ): Promise<void> {
    await this.streamAI(`/ai/nodes/${nodeId}/quiz`, onChunk, {
      ...request,
      stream: true,
    });
  }

  async summarizeNodeStream(
    nodeId: number,
    onChunk: (chunk: string) => void,
    request: AIRequest = {}
  ): Promise<void> {
    await this.streamAI(`/ai/nodes/${nodeId}/summarize`, onChunk, {
      ...request,
      stream: true,
    });
  }

  private async streamAI(
    endpoint: string,
    onChunk: (chunk: string) => void,
    request: AIRequest
  ): Promise<void> {
    const response = await this.fastapi.post(endpoint, request, {
      responseType: 'stream',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    // Handle streaming (implementation depends on environment)
    // This is a basic example - you may need to adapt for browser vs Node
    if (typeof window !== 'undefined') {
      // Browser environment - use fetch for SSE
      const fetchResponse = await fetch(`${this.fastapiURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(request),
      });

      const reader = fetchResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            onChunk(data);
          }
        }
      }
    }
  }
}

export const createAPIClient = (baseURL?: string, fastapiURL?: string) => {
  return new APIClient(baseURL, fastapiURL);
};
