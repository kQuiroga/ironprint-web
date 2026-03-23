import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseService } from '@/services/exercise.service';
import type { CreateExerciseRequest, UpdateExerciseRequest } from '@/types/api.types';

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: exerciseService.getAll,
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ['exercises', id],
    queryFn: () => exerciseService.getById(id),
    enabled: !!id,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateExerciseRequest) => exerciseService.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exercises'] }),
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateExerciseRequest }) =>
      exerciseService.update(id, body),
    onSuccess: (_data, { id }) =>
      queryClient.invalidateQueries({ queryKey: ['exercises', id] }),
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exerciseService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exercises'] }),
  });
}
