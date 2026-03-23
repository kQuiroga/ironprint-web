import api from '@/services/api';
import type {
  CalendarDayDto,
  WorkoutSessionDto,
  CreateWorkoutSessionRequest,
  CreateSetLogRequest,
} from '@/types/api.types';

async function getCalendar(from: string, to: string): Promise<CalendarDayDto[]> {
  const { data } = await api.get<CalendarDayDto[]>('/workout-sessions/calendar', {
    params: { from, to },
  });
  return data;
}

async function getByDate(date: string): Promise<WorkoutSessionDto> {
  const { data } = await api.get<WorkoutSessionDto>(`/workout-sessions/${date}`);
  return data;
}

async function create(body: CreateWorkoutSessionRequest): Promise<WorkoutSessionDto> {
  const { data } = await api.post<WorkoutSessionDto>('/workout-sessions', body);
  return data;
}

async function logSet(sessionId: string, body: CreateSetLogRequest): Promise<void> {
  await api.post(`/workout-sessions/${sessionId}/sets`, body);
}

export const workoutService = { getCalendar, getByDate, create, logSet };
