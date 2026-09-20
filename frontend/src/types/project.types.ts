export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  myRole: string; // 'OWNER' | 'ADMIN' | 'USER' etc.
}

export interface ProjectRequest {
  name: string;
  description: string;
}

export interface ProjectMember {
  id: number;
  email: string;
  fullName: string;
  role: string;
}
