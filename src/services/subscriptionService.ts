import { api } from './api';
import type { Page, SubscriptionRequest, SubscriptionResponse, SubscriptionStatus } from '@/types';

export interface SubscriptionListParams {
  petId?: number;
  status?: SubscriptionStatus | '';
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export const subscriptionService = {
  create(payload: SubscriptionRequest) {
    return api.post<SubscriptionResponse>('/subscriptions', payload).then((r) => r.data);
  },
  findAll(params: SubscriptionListParams = {}) {
    return api.get<Page<SubscriptionResponse>>('/subscriptions', { params }).then((r) => r.data);
  },
  findById(id: number) {
    return api.get<SubscriptionResponse>(`/subscriptions/${id}`).then((r) => r.data);
  },
  updateStatus(id: number, status: SubscriptionStatus) {
    return api
      .put<SubscriptionResponse>(`/subscriptions/${id}/status`, null, { params: { status } })
      .then((r) => r.data);
  },
  delete(id: number) {
    return api.delete<void>(`/subscriptions/${id}`).then((r) => r.data);
  },
};
