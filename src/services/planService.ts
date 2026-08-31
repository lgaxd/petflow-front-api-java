import { api } from './api';
import type { Page, PlanRequest, PlanResponse } from '@/types';

export interface PlanListParams {
  clinicId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export const planService = {
  create(payload: PlanRequest) {
    return api.post<PlanResponse>('/plans', payload).then((r) => r.data);
  },
  findAll(params: PlanListParams = {}) {
    return api.get<Page<PlanResponse>>('/plans', { params }).then((r) => r.data);
  },
  findById(id: number) {
    return api.get<PlanResponse>(`/plans/${id}`).then((r) => r.data);
  },
  update(id: number, payload: PlanRequest) {
    return api.put<PlanResponse>(`/plans/${id}`, payload).then((r) => r.data);
  },
  delete(id: number) {
    return api.delete<void>(`/plans/${id}`).then((r) => r.data);
  },
};
