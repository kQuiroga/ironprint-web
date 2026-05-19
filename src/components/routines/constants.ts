import { DayOfWeek, MuscleGroup } from '@/types/api.types';

export const DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.Monday]: 'Lunes',
  [DayOfWeek.Tuesday]: 'Martes',
  [DayOfWeek.Wednesday]: 'Miércoles',
  [DayOfWeek.Thursday]: 'Jueves',
  [DayOfWeek.Friday]: 'Viernes',
  [DayOfWeek.Saturday]: 'Sábado',
  [DayOfWeek.Sunday]: 'Domingo',
};

export const DAY_ORDER: DayOfWeek[] = [
  DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
  DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday,
];

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
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

export const ALL_MUSCLE_GROUPS = Object.values(MuscleGroup);
