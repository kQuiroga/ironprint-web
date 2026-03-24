import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dayLogService } from '@/services/day-log.service';
import type { DayLogStatus } from '@/types/api.types';

export function useUpsertDayLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, status }: { date: string; status: DayLogStatus }) =>
      dayLogService.upsert(date, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-calendar'] });
    },
  });
}

export function useDeleteDayLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => dayLogService.remove(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-calendar'] });
    },
  });
}
