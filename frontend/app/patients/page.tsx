"use client";

import { useEffect, useState } from "react";

import { ProtectedRoute } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { api } from "@/lib/api";

type Patient = {
  id: number;
  full_name: string;
  email: string;
  date_of_birth: string;
  created_at: string;
};

function age(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError]       = useState("");

  useEffect(() => {
    api.get("/api/patients")
      .then((r) => setPatients(r.data.patients))
      .catch(() => setError("Unable to load patients."));
  }, []);

  return (
    <ProtectedRoute>
      <section className="space-y-6">
        <div className="rounded-2xl bg-secondary p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Records</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">Patient Records</h1>
          <p className="mt-3 text-sm text-ink-muted">
            Aadhaar-verified patient directory. Aadhaar numbers are stored only as secure hashes.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Registered Patients", value: patients.length },
            { label: "Aadhaar Verified",    value: patients.length },
            { label: "Identity Method",     value: "Aadhaar Hash" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-white p-6 shadow-card">
              <p className="text-sm text-ink-muted">{s.label}</p>
              <p className="mt-3 text-2xl font-semibold text-ink">{s.value}</p>
            </div>
          ))}
        </div>

        {error ? <Alert>{error}</Alert> : null}

        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
          <table className="min-w-full divide-y divide-border text-left text-sm">
            <thead className="bg-slate-50 text-ink-muted">
              <tr>
                <th className="px-5 py-4 font-medium">#</th>
                <th className="px-5 py-4 font-medium">Full Name</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">Date of Birth</th>
                <th className="px-5 py-4 font-medium">Age</th>
                <th className="px-5 py-4 font-medium">Registered</th>
                <th className="px-5 py-4 font-medium">Identity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-ink-muted">Loading…</td>
                </tr>
              ) : (
                patients.map((p, i) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 text-ink-muted">{i + 1}</td>
                    <td className="px-5 py-4 font-medium text-ink">{p.full_name}</td>
                    <td className="px-5 py-4 text-ink-muted">{p.email}</td>
                    <td className="px-5 py-4 text-ink-muted">
                      {new Date(p.date_of_birth).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{age(p.date_of_birth)} yrs</td>
                    <td className="px-5 py-4 text-ink-muted">
                      {new Date(p.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Aadhaar Verified
                      </span>
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
