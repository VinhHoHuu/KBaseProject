import api from './api';
import { Project, ProjectRequest } from '../types/project.types';

export const ProjectService = {
  getAllProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  getProjectById: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (data: ProjectRequest): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  updateProject: async (id: number, data: ProjectRequest): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  }
};
