import api from './api';
import { Document } from '../types/document.types';

export const DocumentService = {
  getDocuments: async (projectId: number): Promise<Document[]> => {
    const response = await api.get(`/projects/${projectId}/documents`);
    return response.data;
  },

  uploadDocument: async (projectId: number, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // API instances need specific Content-Type for FormData
    const response = await api.post(`/projects/${projectId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteDocument: async (projectId: number, documentId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/documents/${documentId}`);
  }
};
