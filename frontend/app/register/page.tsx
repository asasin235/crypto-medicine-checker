"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const initialState = {
  full_name: "",
  email: "",
  aadhaar_number: "",
  date_of_birth: "",
  password: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [formState, setFormState] = useState(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await api.post("/api/patients/register", formState);
      setSuccess("Registration complete. You can log in with your email and password.");
      setFormState(initialState);
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (submissionError) {
      setError("Unable to register with the supplied details.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-8 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">Patient Access</p>
      <h1 className="mt-3 text-3xl font-semibold text-ink">Create your patient account</h1>
      <p className="mt-3 text-sm text-ink-muted">
        Register with your Aadhaar to track prescriptions and verify medicines.
      </p>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            value={formState.full_name}
            onChange={(event) =>
              setFormState((current) => ({ ...current, full_name: event.target.value }))
            }
            required
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
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
            <Label htmlFor="date_of_birth">Date of birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formState.date_of_birth}
              onChange={(event) =>
                setFormState((current) => ({ ...current, date_of_birth: event.target.value }))
              }
              required
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="aadhaar_number">Aadhaar number</Label>
            <Input
              id="aadhaar_number"
              inputMode="numeric"
              maxLength={12}
              value={formState.aadhaar_number}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  aadhaar_number: event.target.value.replace(/\D/g, "").slice(0, 12),
                }))
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
        </div>

        {error ? <Alert>{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Registering..." : "Create patient account"}
        </Button>
      </form>
    </section>
  );
}
