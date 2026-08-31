import { api } from './api';
import type { Page, PetRequest, PetResponse } from '@/types';

export interface PetListParams {
  name?: string;
  tutorId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export const petService = {
  create(payload: PetRequest) {
    return api.post<PetResponse>('/pets', payload).then((r) => r.data);
  },
  findAll(params: PetListParams = {}) {
    return api.get<Page<PetResponse>>('/pets', { params }).then((r) => r.data);
  },
  findById(id: number) {
    return api.get<PetResponse>(`/pets/${id}`).then((r) => r.data);
  },
  update(id: number, payload: PetRequest) {
    return api.put<PetResponse>(`/pets/${id}`, payload).then((r) => r.data);
  },
  delete(id: number) {
    return api.delete<void>(`/pets/${id}`).then((r) => r.data);
  },
};
