import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routineService } from '@/services/routine.service';
import type { CreateRoutineRequest, UpdateRoutineRequest } from '@/types/api.types';

export function useRoutines() {
  return useQuery({
    queryKey: ['routines'],
    queryFn: routineService.getAll,
  });
}

export function useRoutine(id: string) {
  return useQuery({
    queryKey: ['routines', id],
    queryFn: () => routineService.getById(id),
    enabled: !!id,
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRoutineRequest) => routineService.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routines'] }),
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateRoutineRequest }) =>
      routineService.update(id, body),
    onSuccess: (_data, { id }) =>
      queryClient.invalidateQueries({ queryKey: ['routines', id] }),
  });
}

export function useActiveRoutine() {
  return useQuery({
    queryKey: ['routines', 'active'],
    queryFn: routineService.getActive,
  });
}

export function useActivateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => routineService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['workout-calendar'] });
    },
  });
}

export function useDeactivateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => routineService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['workout-calendar'] });
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => routineService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routines'] }),
  });
}
