import api from '@/services/api';
import type { UpsertDayLogRequest } from '@/types/api.types';

async function upsert(date: string, body: UpsertDayLogRequest): Promise<void> {
  await api.put(`/day-logs/${date}`, body);
}

async function remove(date: string): Promise<void> {
  await api.delete(`/day-logs/${date}`);
}

export const dayLogService = { upsert, remove };
