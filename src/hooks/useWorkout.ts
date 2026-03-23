import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutService } from '@/services/workout.service';
import type { CreateWorkoutSessionRequest, CreateSetLogRequest } from '@/types/api.types';

export function useWorkoutCalendar(from: string, to: string) {
  return useQuery({
    queryKey: ['workout-calendar', from, to],
    queryFn: () => workoutService.getCalendar(from, to),
  });
}

export function useWorkoutSession(date: string) {
  return useQuery({
    queryKey: ['workout-session', date],
    queryFn: () => workoutService.getByDate(date),
  });
}

export function useCreateWorkoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkoutSessionRequest) => workoutService.create(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workout-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['workout-session', data.date] });
    },
  });
}

export function useLogSet(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSetLogRequest) => workoutService.logSet(sessionId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workout-session'] }),
  });
}
