'use client';

import { use, useState, useEffect } from 'react';
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
  searchParams: Promise<{ routineDayId?: string }>;
}

const ICON_COLORS = [
  'bg-tertiary-container text-on-tertiary-container',
  'bg-primary-container text-on-primary-container',
  'bg-secondary-container text-on-secondary-container',
];

const startSchema = z.object({
  routineDayId: z.string().min(1, 'Seleccioná un día de rutina'),
});
type StartForm = z.infer<typeof startSchema>;

const logSetSchema = z.object({
  reps: z.number().int().positive('Ingresá las reps'),
  weight: z.number().nonnegative('Ingresá el peso'),
});
type LogSetForm = z.infer<typeof logSetSchema>;

// ─── AddSetForm ───────────────────────────────────────────────────────────────

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
      { sessionId, body: { exerciseId, setNumber: nextSetNumber, reps: values.reps, weight: values.weight } },
      { onSuccess: () => reset() },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex items-end gap-2">
      <div className="flex-1 space-y-1">
        <label className="block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
          Reps
        </label>
        <input
          type="number"
          {...register('reps', { valueAsNumber: true })}
          className={cn(
            'w-full bg-surface-container-high border-none rounded-lg px-3 py-2.5 text-sm text-on-surface outline-none transition-all',
            'focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20',
            errors.reps && 'ring-2 ring-error/30',
          )}
        />
      </div>
      <div className="flex-1 space-y-1">
        <label className="block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
          Peso (kg)
        </label>
        <input
          type="number"
          step="0.5"
          {...register('weight', { valueAsNumber: true })}
          className={cn(
            'w-full bg-surface-container-high border-none rounded-lg px-3 py-2.5 text-sm text-on-surface outline-none transition-all',
            'focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20',
            errors.weight && 'ring-2 ring-error/30',
          )}
        />
      </div>
      <button
        type="submit"
        disabled={logSet.isPending}
        className="signature-gradient text-white rounded-full px-4 py-2.5 text-sm font-bold shadow-sm shadow-primary/20 disabled:opacity-50 transition-all active:scale-95"
      >
        + {nextSetNumber}
      </button>
    </form>
  );
}

// ─── ExerciseCard ─────────────────────────────────────────────────────────────

function ExerciseCard({
  exercise,
  exerciseName,
  sessionId,
  index,
}: {
  exercise: ExerciseLogDto;
  exerciseName: string;
  sessionId: string;
  index: number;
}) {
  const iconColor = ICON_COLORS[index % ICON_COLORS.length];

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 flex items-center gap-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', iconColor)}>
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            fitness_center
          </span>
        </div>
        <div>
          <h3 className="font-bold text-on-surface">{exerciseName}</h3>
          <p className="text-sm text-on-surface-variant">
            {exercise.sets.length} series registradas
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-1 border-t border-outline-variant/10">
        {exercise.sets.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {exercise.sets.map((set) => (
              <div
                key={set.id}
                className="flex items-center gap-4 text-sm text-on-surface-variant"
              >
                <span className="text-[11px] font-bold uppercase tracking-wide text-outline w-14">
                  Serie {set.setNumber}
                </span>
                <span className="text-on-surface font-medium">{set.reps} reps</span>
                <span className="text-on-surface font-medium">{set.weightValue} kg</span>
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

// ─── StartSession ─────────────────────────────────────────────────────────────

function StartSession({ date, routineDayId }: { date: string; routineDayId?: string }) {
  const { data: routines, isLoading } = useRoutines();
  const createSession = useCreateWorkoutSession();
  const [selectedRoutineId, setSelectedRoutineId] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<StartForm>({
    resolver: zodResolver(startSchema),
  });

  useEffect(() => {
    if (routineDayId && !createSession.isPending && !createSession.isSuccess) {
      createSession.mutate({ routineDayId, date });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineDayId]);

  if (routineDayId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-on-surface-variant text-sm">Iniciando sesión...</p>
      </div>
    );
  }

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
      <Link
        href="/calendar"
        className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface mb-6 transition-colors"
      >
        ← Calendario
      </Link>

      <h1 className="text-2xl font-extrabold tracking-tight text-on-surface capitalize mb-1">
        {format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })}
      </h1>
      <p className="text-on-surface-variant mb-8">Sin sesión registrada para este día.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant ml-1">
            Rutina
          </label>
          {isLoading ? (
            <div className="h-12 animate-pulse rounded-xl bg-surface-container-high" />
          ) : (
            <select
              value={selectedRoutineId}
              onChange={(e) => setSelectedRoutineId(e.target.value)}
              className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">Seleccioná una rutina</option>
              {routines?.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}
        </div>

        {selectedRoutine?.days && selectedRoutine.days.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant ml-1">
              Día
            </label>
            <select
              {...register('routineDayId')}
              className={cn(
                'w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-on-surface outline-none transition-all',
                errors.routineDayId
                  ? 'ring-2 ring-error/30'
                  : 'focus:ring-2 focus:ring-primary/20',
              )}
            >
              <option value="">Seleccioná un día</option>
              {[...(selectedRoutine.days as RoutineDayDto[])]
                .sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek))
                .map((day) => (
                  <option key={day.id} value={day.id}>{DAY_LABELS[day.dayOfWeek]}</option>
                ))}
            </select>
            {errors.routineDayId && (
              <p className="ml-1 text-xs text-error">{errors.routineDayId.message}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={createSession.isPending || !selectedRoutineId}
          className="w-full signature-gradient text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
        >
          {createSession.isPending ? 'Iniciando...' : 'Comenzar entrenamiento'}
        </button>
      </form>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WorkoutSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-48 animate-pulse rounded-xl bg-surface-container-high" />
      <div className="h-4 w-32 animate-pulse rounded-xl bg-surface-container-high" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 animate-pulse rounded-xl bg-surface-container-high" />
        <div className="h-20 animate-pulse rounded-xl bg-surface-container-high" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-xl bg-surface-container-high" />
      ))}
    </div>
  );
}

// ─── WorkoutSessionPage ───────────────────────────────────────────────────────

export default function WorkoutSessionPage({ params, searchParams }: Props) {
  const { date } = use(params);
  const { routineDayId } = use(searchParams);
  const { data: session, isLoading, isError, error } = useWorkoutSession(date);
  const { data: exercises } = useExercises();
  const exerciseMap = new Map((exercises ?? []).map((e) => [e.id, e.name]));

  const isNotFound = isError && isAxiosError(error) && error.response?.status === 404;

  if (isLoading) return <WorkoutSkeleton />;
  if (isNotFound) return <StartSession date={date} routineDayId={routineDayId} />;
  if (isError) return (
    <div className="py-16 text-center text-on-surface-variant">
      Error al cargar la sesión.
    </div>
  );
  if (!session) return null;

  return (
    <div>
      <Link
        href="/calendar"
        className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface mb-6 transition-colors"
      >
        ← Calendario
      </Link>

      {/* Badge + title */}
      <div className="mb-6">
        <span className="inline-block px-3 py-1 mb-3 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold uppercase tracking-wider">
          Sesión activa
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface capitalize">
          {format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })}
        </h1>
      </div>

      {/* Stats bento */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-surface-container-low p-5 rounded-xl">
          <p className="text-[11px] font-bold uppercase tracking-wider text-outline mb-2">Ejercicios</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-on-surface">{session.exercises.length}</span>
            <span className="text-sm text-on-surface-variant">total</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-5 rounded-xl">
          <p className="text-[11px] font-bold uppercase tracking-wider text-outline mb-2">Series</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-on-surface">
              {session.exercises.reduce((acc, e) => acc + e.sets.length, 0)}
            </span>
            <span className="text-sm text-on-surface-variant">registradas</span>
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="space-y-4">
        {session.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            exerciseName={exerciseMap.get(exercise.exerciseId) ?? exercise.exerciseId}
            sessionId={session.id}
            index={index}
          />
        ))}
      </div>

      {/* Complete button */}
      <div className="mt-10">
        <Link
          href="/calendar"
          className="w-full signature-gradient text-white font-bold py-5 rounded-full shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <span>Finalizar entrenamiento</span>
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            done_all
          </span>
        </Link>
      </div>
    </div>
  );
}
