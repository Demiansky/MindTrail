// User types
export interface UserDTO {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

// Auth types
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// Tree types
export interface TreeMemberDTO {
  id: number;
  tree: number;
  user?: UserDTO;
  email?: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
}

export interface TreeDTO {
  id: number;
  owner: UserDTO;
  title: string;
  visibility: 'private' | 'shared' | 'public';
  members: TreeMemberDTO[];
  node_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTreeRequest {
  title: string;
  visibility?: 'private' | 'shared' | 'public';
}

export interface UpdateTreeRequest {
  title?: string;
  visibility?: 'private' | 'shared' | 'public';
}

export interface InviteToTreeRequest {
  email: string;
  role: 'editor' | 'viewer';
}

// Node types
export interface NodeDTO {
  id: number;
  tree: number;
  parent?: number;
  title: string;
  user_notes: string;
  ai_notes: string;
  sibling_order: number;
  created_by: number;
  created_by_username: string;
  children: number[] | NodeDTO[]; // Can be IDs or nested
  created_at: string;
  updated_at: string;
}

export interface CreateNodeRequest {
  tree: number;
  parent?: number;
  title: string;
  user_notes?: string;
  sibling_order?: number;
}

export interface UpdateNodeRequest {
  title?: string;
  user_notes?: string;
  ai_notes?: string;
  parent?: number;
  sibling_order?: number;
}

// AI Message types
export interface AIMessageDTO {
  id: number;
  node: number;
  node_title: string;
  type: 'explain' | 'quiz' | 'summarize';
  prompt: string;
  response: string;
  model_name: string;
  tokens_in: number;
  tokens_out: number;
  request_id: string;
  created_by: number;
  created_by_username: string;
  created_at: string;
}

export interface AIRequest {
  additional_context?: string;
  stream?: boolean;
}

export interface AIResponse {
  request_id: string;
  response: string;
  model_name: string;
  tokens_in: number;
  tokens_out: number;
}

// API Error
export interface APIError {
  detail: string;
  [key: string]: any;
}
