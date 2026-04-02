"use client";

import { useEffect, useState } from "react";

import { ProtectedRoute } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { api } from "@/lib/api";

type Prescription = {
  id: number;
  patient_name: string;
  patient_email: string;
  medicine_name: string;
  sku: string;
  prescriber_name: string;
  dosage: string;
  instructions: string;
  issued_at: string;
};

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/prescriptions")
      .then((r) => setPrescriptions(r.data.prescriptions))
      .catch(() => setError("Unable to load prescriptions."));
  }, []);

  return (
    <ProtectedRoute>
      <section className="space-y-6">
        <div className="rounded-2xl bg-secondary p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Dispensing</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">Prescription Management</h1>
          <p className="mt-3 text-sm text-ink-muted">
            Track prescriptions from issuance to fulfilment — every dispensing event recorded on the ledger.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Prescriptions", value: prescriptions.length },
            { label: "Unique Patients",      value: [...new Set(prescriptions.map((p) => p.patient_name))].length },
            { label: "Prescribers",          value: [...new Set(prescriptions.map((p) => p.prescriber_name))].length },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-white p-6 shadow-card">
              <p className="text-sm text-ink-muted">{s.label}</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{s.value}</p>
            </div>
          ))}
        </div>

        {error ? <Alert>{error}</Alert> : null}

        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-8 text-center text-ink-muted shadow-soft">
              Loading…
            </div>
          ) : (
            prescriptions.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-white p-6 shadow-soft hover:shadow-card transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-semibold text-ink">{p.medicine_name}</p>
                      <span className="rounded-full bg-accent-subtle px-3 py-0.5 text-xs font-semibold text-accent">{p.sku}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">
                      <span className="font-medium text-ink">{p.dosage}</span>
                      {p.instructions ? ` — ${p.instructions}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-ink-muted">{new Date(p.issued_at).toLocaleDateString("en-IN")}</p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700">Issued</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl border border-border bg-slate-50 p-4 text-sm">
                  <div>
                    <p className="text-xs text-ink-muted">Patient</p>
                    <p className="font-medium text-ink">{p.patient_name}</p>
                    <p className="text-xs text-ink-muted">{p.patient_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-muted">Prescribed by</p>
                    <p className="font-medium text-ink">{p.prescriber_name}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}
