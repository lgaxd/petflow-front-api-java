import { api } from './api';
import type { LoginRequest, LoginResponse } from '@/types';

export const authService = {
  login(payload: LoginRequest) {
    return api.post<LoginResponse>('/auth/login', payload).then((r) => r.data);
  },
};
