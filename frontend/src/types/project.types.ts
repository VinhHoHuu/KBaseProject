export type ProjectStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
  myRole: string; // 'OWNER' | 'ADMIN' | 'USER' etc.
}

export interface ProjectRequest {
  name: string;
  description: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: ProjectStatus;
}

export interface ProjectMember {
  id: number;
  email: string;
  fullName: string;
  role: string;
}
