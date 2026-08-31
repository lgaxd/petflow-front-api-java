import { api } from './api';
import type { HealthEventRequest, HealthEventResponse, HealthEventStatus, Page } from '@/types';

export interface HealthEventListParams {
  petId?: number;
  status?: HealthEventStatus | '';
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export const healthEventService = {
  create(payload: HealthEventRequest) {
    return api.post<HealthEventResponse>('/health-events', payload).then((r) => r.data);
  },
  findAll(params: HealthEventListParams = {}) {
    return api.get<Page<HealthEventResponse>>('/health-events', { params }).then((r) => r.data);
  },
  findById(id: number) {
    return api.get<HealthEventResponse>(`/health-events/${id}`).then((r) => r.data);
  },
  update(id: number, payload: HealthEventRequest) {
    return api.put<HealthEventResponse>(`/health-events/${id}`, payload).then((r) => r.data);
  },
  delete(id: number) {
    return api.delete<void>(`/health-events/${id}`).then((r) => r.data);
  },
};
