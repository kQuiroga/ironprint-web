'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { ExerciseDto } from '@/types/api.types';
import { cn } from '@/lib/cn';
import { RoutineFormValues } from './schema';

// ── ExerciseRow ───────────────────────────────────────────────────────────────

interface ExerciseRowProps {
  register: UseFormRegister<RoutineFormValues>;
  errors: FieldErrors<RoutineFormValues>;
  dayIndex: number;
  exIndex: number;
  onRemove: () => void;
  availableExercises: ExerciseDto[];
  showLabels: boolean;
}

export function ExerciseRow({ register, errors, dayIndex, exIndex, onRemove, availableExercises, showLabels }: ExerciseRowProps) {
  const exErrors = errors.days?.[dayIndex]?.exercises?.[exIndex];
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        {showLabels && (
          <label className="mb-1 block text-xs text-on-surface-variant">Ejercicio</label>
        )}
        <select
          {...register(`days.${dayIndex}.exercises.${exIndex}.exerciseId`)}
          className={cn(
            'w-full rounded-xl border px-3 py-1.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-high',
            exErrors?.exerciseId ? 'border-error' : 'border-outline-variant/20',
          )}
        >
          <option value="">Seleccioná...</option>
          {availableExercises.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>
      <div className="w-20">
        {showLabels && (
          <label className="mb-1 block text-xs text-on-surface-variant">Series</label>
        )}
        <input
          type="number"
          {...register(`days.${dayIndex}.exercises.${exIndex}.targetSets`, { valueAsNumber: true })}
          placeholder="3"
          className={cn(
            'w-full rounded-xl border px-2 py-1.5 text-center text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-high',
            exErrors?.targetSets ? 'border-error' : 'border-outline-variant/20',
          )}
        />
      </div>
      <div className="w-20">
        {showLabels && (
          <label className="mb-1 block text-xs text-on-surface-variant">Reps</label>
        )}
        <input
          type="number"
          {...register(`days.${dayIndex}.exercises.${exIndex}.targetReps`, { valueAsNumber: true })}
          placeholder="10"
          className={cn(
            'w-full rounded-xl border px-2 py-1.5 text-center text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-high',
            exErrors?.targetReps ? 'border-error' : 'border-outline-variant/20',
          )}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-2xl px-2 py-1.5 text-sm text-on-surface-variant hover:bg-error-container/20 hover:text-error"
      >
        x
      </button>
    </div>
  );
}
