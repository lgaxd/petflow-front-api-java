// Tipos espelhando os DTOs e enums da API PetFlow (Spring Boot)

export type UserRole = 'ADMIN' | 'TUTOR';
export type CouponStatus = 'DISPONIVEL' | 'RESGATADO' | 'UTILIZADO';
export type HealthEventStatus = 'AGENDADO' | 'REALIZADO' | 'CANCELADO';
export type SubscriptionStatus = 'ATIVO' | 'ENCERRADO' | 'CANCELADO' | 'EXPIRADO';

// ---------- Paginação (Spring Data Page<T>) ----------
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página atual (0-based)
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// ---------- Erro padrão da API ----------
export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  code?: string;
  path?: string;
  validationErrors?: Record<string, string>;
  details?: Record<string, unknown>;
}

// ---------- Auth ----------
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

// ---------- Tutor ----------
export interface TutorRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface TutorResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

// ---------- Clínica ----------
export interface ClinicRequest {
  name: string;
  address?: string;
  phone?: string;
  cnpj: string;
}

export interface ClinicResponse {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  cnpj: string;
  createdAt: string;
}

// ---------- Plano ----------
export interface PlanRequest {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  pointsPerEvent: number;
  clinicId: number;
}

export interface PlanResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  pointsPerEvent: number;
  clinicId: number;
  clinicName: string;
}

// ---------- Cupom ----------
export interface CouponRequest {
  code: string;
  status: CouponStatus;
  expirationDate?: string; // yyyy-MM-dd
  templateId: number;
}

export interface CouponResponse {
  id: number;
  code: string;
  status: CouponStatus;
  expirationDate?: string;
  templateId: number;
  createdAt: string;
}

// ---------- Pet ----------
export interface PetRequest {
  name: string;
  breed?: string;
  birthDate?: string; // yyyy-MM-dd
  weight?: number;
  tutorId: number;
  speciesId: number;
}

export interface PetResponse {
  id: number;
  name: string;
  breed?: string;
  birthDate?: string;
  weight?: number;
  speciesId: number;
  createdAt: string;
  tutorId: number;
  tutorName: string;
}

// ---------- Evento de Saúde ----------
export interface HealthEventRequest {
  description?: string;
  eventDate: string; // yyyy-MM-dd
  status: HealthEventStatus;
  petId: number;
  eventTypeId: number;
  clinicId?: number;
}

export interface HealthEventResponse {
  id: number;
  description?: string;
  eventDate: string;
  status: HealthEventStatus;
  createdAt: string;
  petId: number;
  petName: string;
  eventTypeId: number;
  clinicId?: number;
  clinicName?: string;
}

// ---------- Assinatura ----------
export interface SubscriptionRequest {
  startDate: string; // yyyy-MM-dd
  endDate?: string;
  status?: SubscriptionStatus;
  petId: number;
  planId: number;
}

export interface SubscriptionResponse {
  id: number;
  startDate: string;
  endDate?: string;
  status: SubscriptionStatus;
  createdAt: string;
  petId: number;
  petName: string;
  planId: number;
  planName: string;
}

// ---------- Gamificação / Pontos ----------
export interface PointHistoryEntry {
  id: number;
  points: number;
  reason: string;
  referenceType: string;
  referenceId: number;
  createdAt: string;
}

export interface TutorPoints {
  tutorId: number;
  tutorName: string;
  totalPoints: number;
  history: PointHistoryEntry[];
}

export interface PetRisk {
  petId: number;
  petName: string;
  score: number;
  riskLevel: string;
  riskDescription: string;
}

export interface CouponCatalogEntry {
  id: number;
  code: string;
  title: string;
  pointsRequired: number;
  discountType: string;
  discountValue: number;
  expirationDate?: string;
  available: boolean;
}

// ---------- Resgate ----------
export interface RedeemCouponRequest {
  couponId: number;
}

export interface RedeemResponse {
  id: number;
  pointsUsed: number;
  createdAt: string;
  tutorId: number;
  tutorName: string;
  couponId: number;
  couponCode: string;
}
