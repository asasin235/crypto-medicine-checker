"use client";

import { useEffect, useState } from "react";

import { ProtectedRoute } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { api } from "@/lib/api";

type Medicine = {
  id: number;
  name: string;
  sku: string;
  description: string;
  dosage_form: string;
  strength: string;
  manufacturer_name: string;
  created_at: string;
};

const FORM_COLORS: Record<string, string> = {
  capsule: "bg-sky-50 text-sky-700",
  tablet:  "bg-violet-50 text-violet-700",
  syrup:   "bg-amber-50 text-amber-700",
  injection: "bg-red-50 text-red-700",
};

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/medicines")
      .then((r) => setMedicines(r.data.medicines))
      .catch(() => setError("Unable to load medicines."));
  }, []);

  return (
    <ProtectedRoute>
      <section className="space-y-6">
        <div className="rounded-2xl bg-secondary p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Catalog</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">Medicine Registry</h1>
          <p className="mt-3 text-sm text-ink-muted">
            All registered medicines — dosage details, manufacturer info, and batch linkages.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Registered", value: medicines.length },
            { label: "Manufacturers", value: [...new Set(medicines.map((m) => m.manufacturer_name))].length },
            { label: "Forms", value: [...new Set(medicines.map((m) => m.dosage_form))].length },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-white p-6 shadow-card">
              <p className="text-sm text-ink-muted">{s.label}</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{s.value}</p>
            </div>
          ))}
        </div>

        {error ? <Alert>{error}</Alert> : null}

        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
          <table className="min-w-full divide-y divide-border text-left text-sm">
            <thead className="bg-slate-50 text-ink-muted">
              <tr>
                <th className="px-5 py-4 font-medium">Medicine</th>
                <th className="px-5 py-4 font-medium">SKU</th>
                <th className="px-5 py-4 font-medium">Strength</th>
                <th className="px-5 py-4 font-medium">Form</th>
                <th className="px-5 py-4 font-medium">Manufacturer</th>
                <th className="px-5 py-4 font-medium">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {medicines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-ink-muted">Loading…</td>
                </tr>
              ) : (
                medicines.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{m.name}</p>
                      <p className="text-xs text-ink-muted mt-0.5">{m.description}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-ink-muted">{m.sku}</td>
                    <td className="px-5 py-4 text-ink-muted">{m.strength}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${FORM_COLORS[m.dosage_form] ?? "bg-slate-50 text-slate-700"}`}>
                        {m.dosage_form}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{m.manufacturer_name}</td>
                    <td className="px-5 py-4 text-ink-muted">
                      {new Date(m.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </ProtectedRoute>
  );
}
