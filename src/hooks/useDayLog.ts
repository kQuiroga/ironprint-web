import { useMutation } from '@tanstack/react-query';
import { dayLogService } from '@/services/day-log.service';
import type { DayLogStatus } from '@/types/api.types';

export function useUpsertDayLog() {
  return useMutation({
    mutationFn: ({ date, status }: { date: string; status: DayLogStatus }) =>
      dayLogService.upsert(date, { status }),
  });
}

export function useDeleteDayLog() {
  return useMutation({
    mutationFn: (date: string) => dayLogService.remove(date),
  });
}
