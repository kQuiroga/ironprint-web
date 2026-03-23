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
  Forearms = 'Forearms',
  Abs = 'Abs',
  Quads = 'Quads',
  Hamstrings = 'Hamstrings',
  Glutes = 'Glutes',
  Calves = 'Calves',
  FullBody = 'FullBody',
  Cardio = 'Cardio',
  Other = 'Other',
}

// System.DayOfWeek de .NET serializado como string con JsonStringEnumConverter
export enum DayOfWeek {
  Sunday = 'Sunday',
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
}

export interface ExerciseDto {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  notes?: string;
  createdAt: string;
}

export interface CreateExerciseRequest {
  name: string;
  muscleGroup: MuscleGroup;
  notes?: string;
}

export interface UpdateExerciseRequest {
  name: string;
  muscleGroup: MuscleGroup;
  notes?: string;
}

export interface RoutineExerciseDto {
  id: string;
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
}

export interface RoutineDayDto {
  id: string;
  dayOfWeek: DayOfWeek;
  exercises: RoutineExerciseDto[];
}

export interface RoutineDto {
  id: string;
  name: string;
  weeksDuration: number;
  createdAt: string;
  days: RoutineDayDto[];
}

export interface CreateRoutineExerciseRequest {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
}

export interface CreateRoutineDayRequest {
  dayOfWeek: DayOfWeek;
  exercises: CreateRoutineExerciseRequest[];
}

export interface CreateRoutineRequest {
  name: string;
  weeksDuration: number;
  days?: CreateRoutineDayRequest[];
}

export interface UpdateRoutineRequest {
  name: string;
  weeksDuration: number;
}

export interface CalendarDayDto {
  date: string;
  hasSession: boolean;
}

export interface SetLogDto {
  id: string;
  setNumber: number;
  weightValue: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseLogDto {
  id: string;
  exerciseId: string;
  order: number;
  sets: SetLogDto[];
}

export interface WorkoutSessionDto {
  id: string;
  date: string;
  routineDayId: string | null;
  exercises: ExerciseLogDto[];
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
