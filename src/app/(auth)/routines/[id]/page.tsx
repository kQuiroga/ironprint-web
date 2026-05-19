'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRoutine } from '@/hooks/useRoutines';
import { useExercises } from '@/hooks/useExercises';
import { DayOfWeek, MuscleGroup } from '@/types/api.types';

const DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.Monday]: 'Lunes',
  [DayOfWeek.Tuesday]: 'Martes',
  [DayOfWeek.Wednesday]: 'Miércoles',
  [DayOfWeek.Thursday]: 'Jueves',
  [DayOfWeek.Friday]: 'Viernes',
  [DayOfWeek.Saturday]: 'Sábado',
  [DayOfWeek.Sunday]: 'Domingo',
};

const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  [MuscleGroup.Chest]: 'Pecho',
  [MuscleGroup.Back]: 'Espalda',
  [MuscleGroup.Shoulders]: 'Hombros',
  [MuscleGroup.Biceps]: 'Bíceps',
  [MuscleGroup.Triceps]: 'Tríceps',
  [MuscleGroup.Forearms]: 'Antebrazos',
  [MuscleGroup.Abs]: 'Abdominales',
  [MuscleGroup.Quads]: 'Cuádriceps',
  [MuscleGroup.Hamstrings]: 'Isquiotibiales',
  [MuscleGroup.Glutes]: 'Glúteos',
  [MuscleGroup.Calves]: 'Gemelos',
  [MuscleGroup.FullBody]: 'Cuerpo completo',
  [MuscleGroup.Cardio]: 'Cardio',
  [MuscleGroup.Other]: 'Otro',
};

const DAY_ORDER: DayOfWeek[] = [
  DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
  DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday,
];

interface Props {
  params: Promise<{ id: string }>;
}

export default function RoutineDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: routine, isLoading, isError } = useRoutine(id);
  const { data: exercises } = useExercises();

  const exerciseMap = new Map((exercises ?? []).map((e) => [e.id, e.name]));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-surface-container-high" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-surface-container-high" />
        ))}
      </div>
    );
  }

  if (isError || !routine) {
    return (
      <div className="py-16 text-center">
        <p className="text-on-surface-variant">Rutina no encontrada.</p>
        <Link href="/routines" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Volver a rutinas
        </Link>
      </div>
    );
  }

  const sortedDays = [...routine.days].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek),
  );

  return (
    <div>
      <div className="mb-6">
        <Link href="/routines" className="mb-3 inline-block text-sm text-on-surface-variant hover:text-on-surface">
          ← Rutinas
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              {routine.name}
            </h1>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              {routine.weeksDuration} semanas
            </p>
          </div>
          <Link
            href={`/routines/${id}/edit`}
            className="rounded-2xl border border-outline-variant/20 px-3 py-1.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            Editar
          </Link>
        </div>
      </div>

      {sortedDays.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          Esta rutina no tiene días configurados todavía.
        </p>
      ) : (
        <div className="space-y-4">
          {sortedDays.map((day) => (
            <div key={day.id} className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest">
              <div className="border-b border-outline-variant/10 px-5 py-3">
                <h2 className="font-semibold text-on-surface">
                  {DAY_LABELS[day.dayOfWeek] ?? `Día ${day.dayOfWeek}`}
                  {day.name && (
                    <span className="ml-2 font-normal text-on-surface-variant">— {day.name}</span>
                  )}
                </h2>
                {day.muscleGroups.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {day.muscleGroups.map((mg) => (
                      <span
                        key={mg}
                        className="rounded-full bg-surface-container text-xs text-on-surface-variant px-2 py-0.5"
                      >
                        {MUSCLE_GROUP_LABELS[mg]}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {day.exercises.length === 0 ? (
                <p className="px-5 py-3 text-sm text-on-surface-variant">Sin ejercicios.</p>
              ) : (
                <div className="divide-y divide-outline-variant/10">
                  {[...day.exercises]
                    .sort((a, b) => a.order - b.order)
                    .map((exercise) => (
                      <div key={exercise.id} className="flex items-center justify-between px-5 py-3">
                        <span className="font-medium text-on-surface">
                          {exerciseMap.get(exercise.exerciseId) ?? exercise.exerciseId}
                        </span>
                        <span className="text-sm text-on-surface-variant">
                          {exercise.targetSets} × {exercise.targetReps}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
