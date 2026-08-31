import { api } from './api';
import type { Page, TutorRequest, TutorResponse } from '@/types';

export interface TutorListParams {
  name?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export const tutorService = {
  // Cadastro público (usado pela tela de auto-cadastro do tutor)
  create(payload: TutorRequest) {
    return api.post<TutorResponse>('/tutors', payload).then((r) => r.data);
  },
  findAll(params: TutorListParams = {}) {
    return api.get<Page<TutorResponse>>('/tutors', { params }).then((r) => r.data);
  },
  findById(id: number) {
    return api.get<TutorResponse>(`/tutors/${id}`).then((r) => r.data);
  },
  update(id: number, payload: TutorRequest) {
    return api.put<TutorResponse>(`/tutors/${id}`, payload).then((r) => r.data);
  },
  delete(id: number) {
    return api.delete<void>(`/tutors/${id}`).then((r) => r.data);
  },
};
