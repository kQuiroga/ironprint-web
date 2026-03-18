export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: Record<string, string[]>;
}

export enum MuscleGroup {
  Chest = 'Chest',
  Back = 'Back',
  Shoulders = 'Shoulders',
  Biceps = 'Biceps',
  Triceps = 'Triceps',
  Legs = 'Legs',
  Core = 'Core',
  Glutes = 'Glutes',
  Cardio = 'Cardio',
  FullBody = 'FullBody',
  Other = 'Other',
}

export enum Equipment {
  Barbell = 'Barbell',
  Dumbbell = 'Dumbbell',
  Machine = 'Machine',
  Cable = 'Cable',
  Bodyweight = 'Bodyweight',
  Band = 'Band',
  Kettlebell = 'Kettlebell',
  Other = 'Other',
}

export enum DayOfWeek {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7,
}

export interface ExerciseDto {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment?: Equipment;
  notes?: string;
  createdAt: string;
}

export interface CreateExerciseRequest {
  name: string;
  muscleGroup: MuscleGroup;
  equipment?: Equipment;
  notes?: string;
}

export interface UpdateExerciseRequest {
  name: string;
  muscleGroup: MuscleGroup;
  equipment?: Equipment;
  notes?: string;
}

export interface RoutineExerciseDto {
  id: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  sets: number;
  reps: number;
  weight?: number;
}

export interface RoutineDayDto {
  id: string;
  dayOfWeek: DayOfWeek;
  exercises: RoutineExerciseDto[];
}

export interface RoutineDto {
  id: string;
  name: string;
  description?: string;
  days?: RoutineDayDto[];
  createdAt: string;
}

export interface CreateRoutineExerciseRequest {
  exerciseId: string;
  order: number;
  sets: number;
  reps: number;
  weight?: number;
}

export interface CreateRoutineDayRequest {
  dayOfWeek: DayOfWeek;
  exercises: CreateRoutineExerciseRequest[];
}

export interface CreateRoutineRequest {
  name: string;
  description?: string;
  days: CreateRoutineDayRequest[];
}

export interface UpdateRoutineExerciseRequest {
  exerciseId: string;
  order: number;
  sets: number;
  reps: number;
  weight?: number;
}

export interface UpdateRoutineDayRequest {
  dayOfWeek: DayOfWeek;
  exercises: UpdateRoutineExerciseRequest[];
}

export interface UpdateRoutineRequest {
  name: string;
  description?: string;
  days: CreateRoutineDayRequest[];
}

export interface CalendarDayDto {
  date: string;
  hasSession: boolean;
}

export interface SetLogDto {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  completedAt: string;
}

export interface ExerciseLogDto {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: SetLogDto[];
}

export interface WorkoutSessionDto {
  id: string;
  date: string;
  routineDayId: string;
  routineName: string;
  dayOfWeek: DayOfWeek;
  exercises: ExerciseLogDto[];
  startedAt: string;
  completedAt?: string;
}

export interface CreateWorkoutSessionRequest {
  routineDayId: string;
  date: string;
}

export interface CreateSetLogRequest {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
}
