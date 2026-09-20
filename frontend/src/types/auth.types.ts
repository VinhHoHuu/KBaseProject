export interface User {
  id: number;
  email: string;
  fullName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  fullName: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
