import api from '@/services/api';
import type {
  RoutineDto,
  CreateRoutineRequest,
  UpdateRoutineRequest,
} from '@/types/api.types';

async function getAll(): Promise<RoutineDto[]> {
  const { data } = await api.get<RoutineDto[]>('/routines');
  return data;
}

async function getById(id: string): Promise<RoutineDto> {
  const { data } = await api.get<RoutineDto>(`/routines/${id}`);
  return data;
}

async function create(body: CreateRoutineRequest): Promise<RoutineDto> {
  const { data } = await api.post<RoutineDto>('/routines', body);
  return data;
}

async function update(id: string, body: UpdateRoutineRequest): Promise<RoutineDto> {
  const { data } = await api.put<RoutineDto>(`/routines/${id}`, body);
  return data;
}

async function remove(id: string): Promise<void> {
  await api.delete(`/routines/${id}`);
}

export const routineService = { getAll, getById, create, update, remove };
