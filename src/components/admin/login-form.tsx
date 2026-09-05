"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { loginAction } from "@/lib/actions/auth";
import { idleState } from "@/lib/actions/shared";
import { FormError } from "./primitives";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, idleState);

  return (
    <form action={action} className="space-y-5">
      <FormError>{state.error}</FormError>

      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue="roger@rogerraker.com"
          placeholder="you@email.com"
          required
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        <Lock size={15} strokeWidth={1.5} />
        {pending ? "Checking…" : "Sign in"}
      </Button>
    </form>
  );
}
