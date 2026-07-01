"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormValues } from "@/validations/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setErrorServidor(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("invalid_credentials")
      ) {
        setErrorServidor("Email o contrasena incorrectos.");
      } else if (error.message.includes("Email not confirmed")) {
        setErrorServidor("Debes confirmar tu email antes de ingresar.");
      } else {
        setErrorServidor("Ocurrio un error. Intenta de nuevo.");
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido</h1>
      <p className="text-sm text-gray-500 mb-7">Ingresa tu email y contraseña para continuar</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register("password")}
        />

        {errorServidor && (
          <div className="rounded-lg bg-danger-50 border border-danger-100 px-3 py-2.5">
            <p className="text-sm text-danger-700">{errorServidor}</p>
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isSubmitting}
          className="mt-2"
        >
          Ingresar
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        ¿No tenés cuenta?{" "}
        <Link
          href="/registro"
          className="font-medium text-primary-600 hover:text-primary-700"
       >
          Registrarse
        </Link>
      </p>
    </div>
  );
}
