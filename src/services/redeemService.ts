import { api } from './api';
import type { Page, RedeemResponse } from '@/types';

export interface RedeemListParams {
  tutorId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export const redeemService = {
  findAll(params: RedeemListParams = {}) {
    return api.get<Page<RedeemResponse>>('/redeems', { params }).then((r) => r.data);
  },
  findById(id: number) {
    return api.get<RedeemResponse>(`/redeems/${id}`).then((r) => r.data);
  },
};
