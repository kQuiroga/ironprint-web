'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { DayLogStatus } from '@/types/api.types';
import { useUpsertDayLog, useDeleteDayLog } from '@/hooks/useDayLog';
import { cn } from '@/lib/cn';

interface DayLogPopoverProps {
  date: string;
  currentStatus: DayLogStatus | null;
  routineDayId: string | null;
  hasSession: boolean;
  onClose: () => void;
}

export function DayLogPopover({ date, currentStatus, routineDayId, hasSession, onClose }: DayLogPopoverProps) {
  const queryClient = useQueryClient();
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
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ['workout-calendar'] });
      onClose();
    };
    if (currentStatus === status) {
      remove.mutate(date, { onSuccess });
    } else {
      upsert.mutate({ date, status }, { onSuccess });
    }
  }

  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold tracking-tight text-on-surface">{date}</h2>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:bg-surface-variant transition-colors"
          aria-label="Cerrar"
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            close
          </span>
        </button>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => handleStatus(DayLogStatus.Completed)}
          disabled={isPending}
          className={cn(
            'w-full h-16 rounded-full flex items-center justify-center gap-3 font-bold text-base transition-all duration-200 active:scale-[0.98]',
            currentStatus === DayLogStatus.Completed
              ? 'bg-tertiary-container text-on-tertiary-container'
              : 'signature-gradient text-white shadow-lg shadow-primary/20',
          )}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            check_circle
          </span>
          Completado
        </button>

        <button
          onClick={() => handleStatus(DayLogStatus.NotCompleted)}
          disabled={isPending}
          className={cn(
            'w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all duration-200',
            currentStatus === DayLogStatus.NotCompleted
              ? 'bg-error-container text-on-error-container'
              : 'bg-error-container/20 text-error hover:bg-error-container/40',
          )}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            block
          </span>
          No completado
        </button>

        {error && (
          <p className="text-xs text-error text-center pt-1">Algo salió mal. Intentá de nuevo.</p>
        )}

        <div className="pt-2 border-t border-outline-variant/20 space-y-2">
          <Link
            href={`/workout/${date}${routineDayId ? `?routineDayId=${routineDayId}` : ''}`}
            onClick={onClose}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all duration-200 bg-primary-container/40 text-on-primary-container hover:bg-primary-container/60"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              edit_note
            </span>
            Registrar
          </Link>

          <Link
            href={`/workout/${date}${routineDayId ? `?routineDayId=${routineDayId}` : ''}`}
            onClick={onClose}
            className={cn(
              'w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all duration-200',
              hasSession
                ? 'bg-tertiary-container/40 text-on-tertiary-container hover:bg-tertiary-container/60'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container',
            )}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              fitness_center
            </span>
            Entrenar
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile: bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 md:hidden">
        <div className="relative bg-surface rounded-t-3xl shadow-2xl px-8 pt-4 pb-10">
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1.5 rounded-full bg-outline-variant/30" />
          </div>
          {content}
        </div>
      </div>

      {/* Desktop: centered modal */}
      <div className="absolute inset-0 hidden md:flex items-center justify-center">
        <div className="relative bg-surface rounded-3xl shadow-2xl px-8 py-8 w-full max-w-sm">
          {content}
        </div>
      </div>
    </div>
  );
}
