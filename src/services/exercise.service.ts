import api from '@/services/api';
import type {
  ExerciseDto,
  CreateExerciseRequest,
  UpdateExerciseRequest,
} from '@/types/api.types';

async function getAll(): Promise<ExerciseDto[]> {
  const { data } = await api.get<ExerciseDto[]>('/exercises');
  return data;
}

async function getById(id: string): Promise<ExerciseDto> {
  const { data } = await api.get<ExerciseDto>(`/exercises/${id}`);
  return data;
}

async function create(body: CreateExerciseRequest): Promise<ExerciseDto> {
  const { data } = await api.post<ExerciseDto>('/exercises', body);
  return data;
}

async function update(id: string, body: UpdateExerciseRequest): Promise<ExerciseDto> {
  const { data } = await api.put<ExerciseDto>(`/exercises/${id}`, body);
  return data;
}

async function remove(id: string): Promise<void> {
  await api.delete(`/exercises/${id}`);
}

export const exerciseService = { getAll, getById, create, update, remove };
