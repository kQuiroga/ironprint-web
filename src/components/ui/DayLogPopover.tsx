'use client';

import { useEffect, type CSSProperties } from 'react';
import { DayLogStatus } from '@/types/api.types';
import { useUpsertDayLog, useDeleteDayLog } from '@/hooks/useDayLog';
import { cn } from '@/lib/cn';

interface DayLogPopoverProps {
  date: string;
  currentStatus: DayLogStatus | null;
  onClose: () => void;
  style?: CSSProperties;
}

export function DayLogPopover({ date, currentStatus, onClose, style }: DayLogPopoverProps) {
  const upsert = useUpsertDayLog();
  const remove = useDeleteDayLog();
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const error = upsert.error ?? remove.error;
  const isPending = upsert.isPending || remove.isPending;

  function handleStatus(status: DayLogStatus) {
    if (currentStatus === status) {
      remove.mutate(date, { onSuccess: onClose });
    } else {
      upsert.mutate({ date, status }, { onSuccess: onClose });
    }
  }

  return (
    <div
      style={style}
      className="absolute z-50 flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
    >
      <button
        onClick={() => handleStatus(DayLogStatus.Completed)}
        disabled={isPending}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          currentStatus === DayLogStatus.Completed
            ? 'bg-green-500 text-white'
            : 'text-zinc-700 hover:bg-green-50 hover:text-green-700 dark:text-zinc-300 dark:hover:bg-green-950 dark:hover:text-green-400',
        )}
      >
        <span>✓</span>
        Completado
      </button>
      <button
        onClick={() => handleStatus(DayLogStatus.NotCompleted)}
        disabled={isPending}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          currentStatus === DayLogStatus.NotCompleted
            ? 'bg-red-500 text-white'
            : 'text-zinc-700 hover:bg-red-50 hover:text-red-700 dark:text-zinc-300 dark:hover:bg-red-950 dark:hover:text-red-400',
        )}
      >
        <span>✗</span>
        No completado
      </button>
      {error && (
        <p className="px-1 pt-1 text-xs text-red-500">
          Algo salió mal. Intentá de nuevo.
        </p>
      )}
    </div>
  );
}
