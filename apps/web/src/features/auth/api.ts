import type { AuthResponse, AuthUser } from '@pregao/shared';
import { http } from '@/lib/http';
import type { LoginInput, RegisterInput } from './schemas';

export const login = (input: LoginInput) =>
  http<AuthResponse>('/auth/login', { method: 'POST', body: input });

export const register = (input: RegisterInput) =>
  http<AuthResponse>('/auth/register', { method: 'POST', body: input });

export const fetchMe = () => http<AuthUser>('/auth/me');
