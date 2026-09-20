import api from './api';
import { ProjectMember } from '../types/project.types';

export const MemberService = {
  getMembers: async (projectId: number): Promise<ProjectMember[]> => {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data;
  },

  addMember: async (projectId: number, email: string): Promise<void> => {
    await api.post(`/projects/${projectId}/members`, { email });
  },

  removeMember: async (projectId: number, memberId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/members/${memberId}`);
  }
};
