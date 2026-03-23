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

// POST /routines devuelve el Guid de la rutina creada (201 Created)
async function create(body: CreateRoutineRequest): Promise<string> {
  const { data } = await api.post<string>('/routines', body);
  return data;
}

// PUT /routines/{id} devuelve 204 No Content
async function update(id: string, body: UpdateRoutineRequest): Promise<void> {
  await api.put(`/routines/${id}`, body);
}

async function remove(id: string): Promise<void> {
  await api.delete(`/routines/${id}`);
}

export const routineService = { getAll, getById, create, update, remove };
