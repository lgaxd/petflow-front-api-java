import { api } from './api';
import type { CouponCatalogEntry, Page, PetRisk, RedeemResponse, TutorPoints } from '@/types';

export const gamificationService = {
  getMyPoints() {
    return api.get<TutorPoints>('/gamification/points').then((r) => r.data);
  },
  getPetRisk(petId: number) {
    return api.get<PetRisk>(`/gamification/pets/${petId}/risk`).then((r) => r.data);
  },
  getAvailableCoupons(page = 0, size = 10) {
    return api
      .get<Page<CouponCatalogEntry>>('/gamification/coupons/available', { params: { page, size } })
      .then((r) => r.data);
  },
  redeemCoupon(couponId: number) {
    return api.post<RedeemResponse>('/gamification/redeem', { couponId }).then((r) => r.data);
  },
};
