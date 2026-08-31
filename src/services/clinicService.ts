import { api } from './api';
import type { ClinicRequest, ClinicResponse, Page } from '@/types';

export interface ClinicListParams {
  name?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export const clinicService = {
  create(payload: ClinicRequest) {
    return api.post<ClinicResponse>('/clinics', payload).then((r) => r.data);
  },
  findAll(params: ClinicListParams = {}) {
    return api.get<Page<ClinicResponse>>('/clinics', { params }).then((r) => r.data);
  },
  findById(id: number) {
    return api.get<ClinicResponse>(`/clinics/${id}`).then((r) => r.data);
  },
  update(id: number, payload: ClinicRequest) {
    return api.put<ClinicResponse>(`/clinics/${id}`, payload).then((r) => r.data);
  },
  delete(id: number) {
    return api.delete<void>(`/clinics/${id}`).then((r) => r.data);
  },
};
