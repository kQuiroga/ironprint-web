"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AxiosError } from "axios";
import type { ApiError } from "@/types/api.types";
import { cn } from "@/lib/cn";

const registerSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .regex(/[^a-zA-Z0-9]/, "Debe contener al menos un carácter especial"),
    confirmPassword: z.string().min(1, "Confirmá tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    setError(null);
    try {
      await registerUser({ email: data.email, password: data.password });
      router.push("/");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const apiError = err.response.data as ApiError;
        setError(apiError.detail ?? apiError.title ?? "No se pudo crear la cuenta.");
      } else {
        setError("No se pudo crear la cuenta. Intentá de nuevo.");
      }
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-background">
      {/* Ambient blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 bg-secondary-container opacity-30 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary-container opacity-20 rounded-full blur-[150px] -z-10" />

      {/* Header */}
      <header className="w-full max-w-md mb-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary-container rounded-3xl flex items-center justify-center mb-5 shadow-sm shadow-primary/10">
          <span
            className="material-symbols-outlined text-primary text-4xl"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            fitness_center
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">
          Crear cuenta
        </h1>
        <p className="text-on-surface-variant text-base">
          Empezá a trackear tu progreso hoy.
        </p>
      </header>

      {/* Card */}
      <main className="w-full max-w-md bg-surface-container-low p-8 rounded-2xl shadow-[0_32px_64px_-12px_rgba(57,56,47,0.08)]">
        {error && (
          <div className="mb-6 rounded-xl bg-error-container/20 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-bold tracking-wider uppercase text-on-surface-variant/80 ml-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nombre@ejemplo.com"
              {...register("email")}
              className={cn(
                "w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface placeholder-outline outline-none transition-all duration-200",
                "focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20",
                errors.email && "ring-2 ring-error/30"
              )}
            />
            {errors.email && (
              <p className="ml-1 text-xs text-error">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold tracking-wider uppercase text-on-surface-variant/80 ml-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mín. 8 caracteres"
              {...register("password")}
              className={cn(
                "w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface placeholder-outline outline-none transition-all duration-200",
                "focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20",
                errors.password && "ring-2 ring-error/30"
              )}
            />
            {errors.password && (
              <p className="ml-1 text-xs text-error">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold tracking-wider uppercase text-on-surface-variant/80 ml-1"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className={cn(
                "w-full bg-surface-container-high border-none rounded-xl px-5 py-4 text-on-surface placeholder-outline outline-none transition-all duration-200",
                "focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20",
                errors.confirmPassword && "ring-2 ring-error/30"
              )}
            />
            {errors.confirmPassword && (
              <p className="ml-1 text-xs text-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full signature-gradient text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center">
        <p className="text-on-surface-variant text-sm">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline decoration-2 underline-offset-4"
          >
            Iniciá sesión
          </Link>
        </p>
      </footer>
    </div>
  );
}
