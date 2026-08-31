import { api } from './api';
import type { CouponRequest, CouponResponse, CouponStatus, Page } from '@/types';

export interface CouponListParams {
  status?: CouponStatus | '';
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export const couponService = {
  create(payload: CouponRequest) {
    return api.post<CouponResponse>('/coupons', payload).then((r) => r.data);
  },
  findAll(params: CouponListParams = {}) {
    return api.get<Page<CouponResponse>>('/coupons', { params }).then((r) => r.data);
  },
  findById(id: number) {
    return api.get<CouponResponse>(`/coupons/${id}`).then((r) => r.data);
  },
  updateStatus(id: number, status: CouponStatus) {
    return api.put<CouponResponse>(`/coupons/${id}/status`, null, { params: { status } }).then((r) => r.data);
  },
  delete(id: number) {
    return api.delete<void>(`/coupons/${id}`).then((r) => r.data);
  },
};
