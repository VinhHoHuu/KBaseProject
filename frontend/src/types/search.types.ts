export interface SearchProject {
    id: number;
    name: string;
    description: string;
    myRole: string;
}

export interface SearchUser {
    id: number;
    email: string;
    fullName: string;
    role: string;
}

export interface SearchDocument {
    id: number;
    name: string;
    url: string;
    projectId: number;
}

export interface SearchResultResponse {
    projects: SearchProject[];
    users: SearchUser[];
    documents: SearchDocument[];
}
