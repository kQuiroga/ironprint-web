'use client';

import { useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useWorkoutCalendar, useCreateWorkoutSession } from '@/hooks/useWorkout';
import { useActiveRoutine } from '@/hooks/useRoutines';
import { useExercises } from '@/hooks/useExercises';
import { cn } from '@/lib/cn';

const TODAY = format(new Date(), 'yyyy-MM-dd');

// ─── RestDay ───────────────────────────────────────────────────────────────────

function RestDay() {
  const dayLabel = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center mb-6">
        <span
          className="material-symbols-outlined text-secondary"
          style={{
            fontSize: '48px',
            fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48",
          }}
        >
          bedtime
        </span>
      </div>
      <h1 className="text-2xl font-extrabold text-on-surface mb-2 capitalize">{dayLabel}</h1>
      <h2 className="text-xl font-bold text-on-surface-variant mb-4">Día de descanso</h2>
      <p className="text-on-surface-variant max-w-xs leading-relaxed">
        El descanso es parte del entrenamiento. Tu cuerpo se recupera y crece mientras descansás.
      </p>
    </div>
  );
}

// ─── PlannedDay ────────────────────────────────────────────────────────────────

const DAY_LABELS: Record<string, string> = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sunday: 'Domingo',
};

const ICON_COLORS = [
  'bg-tertiary-container text-on-tertiary-container',
  'bg-primary-container text-on-primary-container',
  'bg-secondary-container text-on-secondary-container',
];

function PlannedDay({ routineDayId, date }: { routineDayId: string; date: string }) {
  const router = useRouter();
  const { data: activeRoutine, isLoading: routineLoading } = useActiveRoutine();
  const { data: exercises } = useExercises();
  const createSession = useCreateWorkoutSession();

  const exerciseMap = new Map((exercises ?? []).map((e) => [e.id, e.name]));
  const day = activeRoutine?.days.find((d) => d.id === routineDayId) ?? null;
  const dayLabel = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  function handleStart() {
    createSession.mutate(
      { routineDayId, date },
      { onSuccess: () => router.replace(`/workout/${date}`) },
    );
  }

  if (routineLoading) return <PageSkeleton />;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <span className="inline-block px-3 py-1 mb-3 rounded-full bg-primary-container text-on-primary-container text-[11px] font-bold uppercase tracking-wider">
          Hoy toca entrenar
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface capitalize">
          {dayLabel}
        </h1>
        {day && (
          <p className="text-on-surface-variant mt-1 text-sm">
            {day.name ?? DAY_LABELS[day.dayOfWeek] ?? day.dayOfWeek}
            {day.muscleGroups.length > 0 && (
              <> · {day.muscleGroups.join(', ')}</>
            )}
          </p>
        )}
      </div>

      {/* Exercise preview */}
      {day && day.exercises.length > 0 && (
        <div className="bg-surface-container-low rounded-3xl p-5 mb-8">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant mb-4">
            Ejercicios de hoy
          </h2>
          <div className="space-y-3">
            {day.exercises.map((ex, i) => (
              <div key={ex.id} className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    ICON_COLORS[i % ICON_COLORS.length],
                  )}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >
                    fitness_center
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-on-surface text-sm">
                    {exerciseMap.get(ex.exerciseId) ?? '—'}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {ex.targetSets}×{ex.targetReps} reps
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No routine data fallback */}
      {!day && !routineLoading && (
        <div className="bg-surface-container-low rounded-3xl p-6 mb-8 text-center">
          <p className="text-on-surface-variant text-sm">
            No se encontró información del día de rutina.
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleStart}
        disabled={createSession.isPending}
        className="w-full signature-gradient text-white font-bold py-5 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {createSession.isPending ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>Iniciando...</span>
          </>
        ) : (
          <>
            <span>Comenzar entrenamiento</span>
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              play_arrow
            </span>
          </>
        )}
      </button>
    </div>
  );
}

// ─── PageSkeleton ──────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-36 animate-pulse rounded-full bg-surface-container-high" />
      <div className="h-9 w-64 animate-pulse rounded-xl bg-surface-container-high" />
      <div className="h-4 w-44 animate-pulse rounded-xl bg-surface-container-high" />
      <div className="mt-6 bg-surface-container-low rounded-3xl p-5 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 animate-pulse rounded-xl bg-surface-container-high shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 animate-pulse rounded bg-surface-container-high" />
              <div className="h-3 w-20 animate-pulse rounded bg-surface-container-high" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-14 animate-pulse rounded-full bg-surface-container-high mt-4" />
    </div>
  );
}

// ─── TodayPage ─────────────────────────────────────────────────────────────────

export default function TodayPage() {
  const router = useRouter();
  const { data: calendarDays, isLoading } = useWorkoutCalendar(TODAY, TODAY);

  const todayData = calendarDays?.[0] ?? null;
  const routineDayId = todayData?.routineDayId ?? null;
  const hasSession = todayData?.hasSession ?? false;

  useEffect(() => {
    if (!isLoading && hasSession) {
      router.replace(`/workout/${TODAY}`);
    }
  }, [isLoading, hasSession, router]);

  if (isLoading || hasSession) return <PageSkeleton />;
  if (!routineDayId) return <RestDay />;
  return <PlannedDay routineDayId={routineDayId} date={TODAY} />;
}
