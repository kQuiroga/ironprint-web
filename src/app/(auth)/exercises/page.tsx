'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useExercises, useCreateExercise, useDeleteExercise } from '@/hooks/useExercises';
import { MuscleGroup } from '@/types/api.types';
import { cn } from '@/lib/cn';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  muscleGroup: z.nativeEnum(MuscleGroup),
  notes: z.string().max(300).optional(),
});
type ExerciseForm = z.infer<typeof schema>;

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

export default function ExercisesPage() {
  const { data: exercises, isLoading } = useExercises();
  const createExercise = useCreateExercise();
  const deleteExercise = useDeleteExercise();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExerciseForm>({
    resolver: zodResolver(schema),
    defaultValues: { muscleGroup: MuscleGroup.Chest },
  });

  function onSubmit(values: ExerciseForm) {
    createExercise.mutate(
      { name: values.name, muscleGroup: values.muscleGroup, notes: values.notes || undefined },
      { onSuccess: () => reset() },
    );
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    deleteExercise.mutate(id);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Ejercicios</h1>

      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Nuevo ejercicio</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="Ej: Press de banca"
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100',
                  errors.name ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-700',
                )}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Grupo muscular <span className="text-red-500">*</span>
              </label>
              <select
                {...register('muscleGroup')}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {Object.entries(MUSCLE_GROUP_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Notas
              </label>
              <input
                {...register('notes')}
                placeholder="Opcional"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={createExercise.isPending}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {createExercise.isPending ? 'Guardando...' : 'Agregar ejercicio'}
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      )}

      {!isLoading && exercises?.length === 0 && (
        <p className="text-center text-zinc-500 dark:text-zinc-400">
          No tenés ejercicios todavía. Agregá uno arriba.
        </p>
      )}

      {!isLoading && exercises && exercises.length > 0 && (
        <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{exercise.name}</p>
                <p className="text-xs text-zinc-500">
                  {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                  {exercise.notes ? ` · ${exercise.notes}` : ''}
                </p>
              </div>
              <button
                onClick={() => handleDelete(exercise.id, exercise.name)}
                disabled={deleteExercise.isPending}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
