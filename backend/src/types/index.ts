import { UserRoles } from "./user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: UserRoles;
  };
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role?: UserRoles;
}

export interface JWTPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}
