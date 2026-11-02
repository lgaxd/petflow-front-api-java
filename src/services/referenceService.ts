import { api } from './api';
import type { EventTypeResponse, SpeciesResponse } from '@/types';

/** Tabelas de domínio da API: os IDs vêm do banco, então os rótulos não ficam fixos no front. */
export const referenceService = {
  species() {
    return api.get<SpeciesResponse[]>('/species').then((r) => r.data);
  },
  eventTypes() {
    return api.get<EventTypeResponse[]>('/event-types').then((r) => r.data);
  },
};
