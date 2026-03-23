'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkoutSession, useCreateWorkoutSession, useLogSet } from '@/hooks/useWorkout';
import { useRoutines } from '@/hooks/useRoutines';
import { useExercises } from '@/hooks/useExercises';
import { cn } from '@/lib/cn';
import { DayOfWeek } from '@/types/api.types';
import type { ExerciseLogDto, RoutineDayDto } from '@/types/api.types';

interface Props {
  params: Promise<{ date: string }>;
}

// ─── Esquema para iniciar sesión ─────────────────────────────────────────────

const startSchema = z.object({
  routineDayId: z.string().min(1, 'Seleccioná un día de rutina'),
});
type StartForm = z.infer<typeof startSchema>;

// ─── Esquema para registrar una serie ────────────────────────────────────────

const logSetSchema = z.object({
  reps: z.number().int().positive('Ingresá las reps'),
  weight: z.number().nonnegative('Ingresá el peso'),
});
type LogSetForm = z.infer<typeof logSetSchema>;

// ─── Componente: formulario para registrar una serie ─────────────────────────

function AddSetForm({
  sessionId,
  exerciseId,
  nextSetNumber,
}: {
  sessionId: string;
  exerciseId: string;
  nextSetNumber: number;
}) {
  const logSet = useLogSet();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LogSetForm>({
    resolver: zodResolver(logSetSchema),
    defaultValues: { reps: 0, weight: 0 },
  });

  function onSubmit(values: LogSetForm) {
    logSet.mutate(
      {
        sessionId,
        body: {
          exerciseId,
          setNumber: nextSetNumber,
          reps: values.reps,
          weight: values.weight,
        },
      },
      { onSuccess: () => reset() },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-3 flex items-end gap-2">
      <div className="flex-1">
        <label className="mb-1 block text-xs text-zinc-500">Reps</label>
        <input
          type="number"
          {...register('reps', { valueAsNumber: true })}
          className={cn(
            'w-full rounded-lg border px-3 py-1.5 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100',
            errors.reps ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-700',
          )}
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-xs text-zinc-500">Peso (kg)</label>
        <input
          type="number"
          step="0.5"
          {...register('weight', { valueAsNumber: true })}
          className={cn(
            'w-full rounded-lg border px-3 py-1.5 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100',
            errors.weight ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-700',
          )}
        />
      </div>
      <button
        type="submit"
        disabled={logSet.isPending}
        className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        + Serie {nextSetNumber}
      </button>
    </form>
  );
}

// ─── Componente: tarjeta de ejercicio ─────────────────────────────────────────

function ExerciseCard({
  exercise,
  exerciseName,
  sessionId,
}: {
  exercise: ExerciseLogDto;
  exerciseName: string;
  sessionId: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {exerciseName}
        </h3>
      </div>

      <div className="px-5 py-3">
        {exercise.sets.length === 0 ? (
          <p className="text-sm text-zinc-400">Sin series registradas todavía.</p>
        ) : (
          <div className="space-y-1">
            {exercise.sets.map((set) => (
              <div
                key={set.id}
                className="flex items-center gap-4 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <span className="w-16 text-xs font-medium text-zinc-400">
                  Serie {set.setNumber}
                </span>
                <span>{set.reps} reps</span>
                <span>{set.weightValue} kg</span>
              </div>
            ))}
          </div>
        )}

        <AddSetForm
          sessionId={sessionId}
          exerciseId={exercise.exerciseId}
          nextSetNumber={exercise.sets.length + 1}
        />
      </div>
    </div>
  );
}

// ─── Componente: iniciar nueva sesión ────────────────────────────────────────

function StartSession({ date }: { date: string }) {
  const { data: routines, isLoading } = useRoutines();
  const createSession = useCreateWorkoutSession();
  const [selectedRoutineId, setSelectedRoutineId] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<StartForm>({
    resolver: zodResolver(startSchema),
  });

  const selectedRoutine = routines?.find((r) => r.id === selectedRoutineId);

  function onSubmit(values: StartForm) {
    createSession.mutate({ routineDayId: values.routineDayId, date });
  }

  const DAY_LABELS: Record<DayOfWeek, string> = {
    [DayOfWeek.Monday]: 'Lunes',
    [DayOfWeek.Tuesday]: 'Martes',
    [DayOfWeek.Wednesday]: 'Miércoles',
    [DayOfWeek.Thursday]: 'Jueves',
    [DayOfWeek.Friday]: 'Viernes',
    [DayOfWeek.Saturday]: 'Sábado',
    [DayOfWeek.Sunday]: 'Domingo',
  };

  const DAY_ORDER: DayOfWeek[] = [
    DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
    DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday,
  ];

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/calendar"
          className="mb-3 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Calendario
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })}
        </h1>
        <p className="mt-1 capitalize text-zinc-500 dark:text-zinc-400">
          No hay sesión registrada para este día.
        </p>
      </div>

      <div className="max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Rutina
            </label>
            {isLoading ? (
              <div className="h-9 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            ) : (
              <select
                value={selectedRoutineId}
                onChange={(e) => setSelectedRoutineId(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">Seleccioná una rutina</option>
                {routines?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedRoutine?.days && selectedRoutine.days.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Día
              </label>
              <select
                {...register('routineDayId')}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100',
                  errors.routineDayId
                    ? 'border-red-400'
                    : 'border-zinc-200 dark:border-zinc-700',
                )}
              >
                <option value="">Seleccioná un día</option>
                {[...(selectedRoutine.days as RoutineDayDto[])]
                  .sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek))
                  .map((day) => (
                    <option key={day.id} value={day.id}>
                      {DAY_LABELS[day.dayOfWeek]}
                    </option>
                  ))}
              </select>
              {errors.routineDayId && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.routineDayId.message}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={createSession.isPending || !selectedRoutineId}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {createSession.isPending ? 'Iniciando...' : 'Comenzar entrenamiento'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WorkoutSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-4 w-32 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      ))}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function WorkoutSessionPage({ params }: Props) {
  const { date } = use(params);
  const { data: session, isLoading, isError, error } = useWorkoutSession(date);
  const { data: exercises } = useExercises();
  const exerciseMap = new Map((exercises ?? []).map((e) => [e.id, e.name]));

  const isNotFound =
    isError && isAxiosError(error) && error.response?.status === 404;

  if (isLoading) return <WorkoutSkeleton />;
  if (isNotFound) return <StartSession date={date} />;
  if (isError) return (
    <div className="py-16 text-center text-zinc-500 dark:text-zinc-400">
      Error al cargar la sesión.
    </div>
  );
  if (!session) return null;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/calendar"
          className="mb-3 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Calendario
        </Link>
        <h1 className="text-2xl font-bold capitalize text-zinc-900 dark:text-zinc-100">
          {format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })}
        </h1>
      </div>

      <div className="space-y-4">
        {session.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            exerciseName={exerciseMap.get(exercise.exerciseId) ?? exercise.exerciseId}
            sessionId={session.id}
          />
        ))}
      </div>
    </div>
  );
}
