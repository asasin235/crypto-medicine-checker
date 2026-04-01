"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const initialState = {
  email: "",
  password: "",
  type: "stakeholder",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [formState, setFormState] = useState(initialState);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post("/api/auth/login", formState);
      login(response.data.token, response.data.user);

      const nextPath = searchParams.get("next");

      if (nextPath) {
        router.push(nextPath);
        return;
      }

      if (response.data.user.role === "central_authority") {
        router.push("/admin/dashboard");
        return;
      }

      router.push("/dashboard");
    } catch (submissionError) {
      setError("Invalid credentials or unauthorized role selection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-border bg-white p-8 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">Welcome back</p>
      <h1 className="mt-3 text-3xl font-semibold text-ink">Sign in to PharmaChain</h1>
      <p className="mt-3 text-sm text-ink-muted">
        Access your supply chain dashboard.
      </p>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="type">Login type</Label>
          <select
            id="type"
            className="h-11 rounded-xl border border-border bg-white px-4 text-sm text-ink shadow-sm outline-none focus:border-accent"
            value={formState.type}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                type: event.target.value as "stakeholder" | "patient",
              }))
            }
          >
            <option value="stakeholder">Stakeholder</option>
            <option value="patient">Patient</option>
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formState.email}
            onChange={(event) =>
              setFormState((current) => ({ ...current, email: event.target.value }))
            }
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formState.password}
            onChange={(event) =>
              setFormState((current) => ({ ...current, password: event.target.value }))
            }
            required
          />
        </div>

        {error ? <Alert>{error}</Alert> : null}

        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<section className="mx-auto max-w-xl rounded-2xl border border-border bg-white p-8 shadow-card" />}>
      <LoginForm />
    </Suspense>
  );
}
