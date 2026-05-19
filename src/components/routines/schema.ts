import { z } from 'zod';
import { DayOfWeek, MuscleGroup } from '@/types/api.types';
import type { RoutineDto } from '@/types/api.types';
import { DAY_ORDER } from './constants';

// ── Schema ────────────────────────────────────────────────────────────────────

const exerciseEntrySchema = z.object({
  exerciseId: z.string().min(1, 'Seleccioná un ejercicio'),
  targetSets: z.number().int().min(1).max(20),
  targetReps: z.number().int().min(1).max(100),
});

const dayEntrySchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  name: z.string().max(100).optional(),
  muscleGroups: z.array(z.nativeEnum(MuscleGroup)),
  exercises: z.array(exerciseEntrySchema).min(1, 'Agregá al menos un ejercicio'),
});

export const routineFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  weeksDuration: z.number().int().min(1).max(52),
  days: z.array(dayEntrySchema),
});

export type RoutineFormValues = z.infer<typeof routineFormSchema>;

// ── DTO → Form Mapper ─────────────────────────────────────────────────────────

export function routineDtoToForm(r: RoutineDto): RoutineFormValues {
  return {
    name: r.name,
    weeksDuration: r.weeksDuration,
    days: r.days
      .slice()
      .sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek))
      .map((d) => ({
        dayOfWeek: d.dayOfWeek,
        name: d.name ?? '',
        muscleGroups: d.muscleGroups ?? [],
        exercises: d.exercises
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((ex) => ({
            exerciseId: ex.exerciseId,
            targetSets: ex.targetSets,
            targetReps: ex.targetReps,
          })),
      })),
  };
}
