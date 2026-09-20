export interface Document {
  id: number;
  name: string;
  type: string;
  size: number;
  url: string;
  projectId: number;
  uploadedById: number;
  uploadedByUsername: string;
  uploadedAt: string;
}
