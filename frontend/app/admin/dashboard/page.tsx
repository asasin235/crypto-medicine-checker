"use client";

import { useEffect, useState } from "react";

import { ProtectedRoute } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { api } from "@/lib/api";

type RoleCount = {
  role: string;
  total: number;
};

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<RoleCount[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/stakeholders/stats")
      .then((response) => {
        setCounts(response.data.counts);
      })
      .catch(() => {
        setError("Unable to load stakeholder counts.");
      });
  }, []);

  return (
    <ProtectedRoute roles={["central_authority"]}>
      <section className="space-y-6">
        <div className="rounded-2xl bg-secondary p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Central Authority</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">Admin dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm text-ink-muted">
            Review stakeholder distribution and jump directly into registration operations.
          </p>
        </div>

        {error ? <Alert>{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {counts.map((count) => (
            <article
              key={count.role}
              className="rounded-2xl border border-border bg-white p-6 shadow-card"
            >
              <p className="text-sm capitalize text-ink-muted">{count.role.replace("_", " ")}</p>
              <p className="mt-4 text-4xl font-semibold text-ink">{count.total}</p>
            </article>
          ))}
        </div>
      </section>
    </ProtectedRoute>
  );
}
