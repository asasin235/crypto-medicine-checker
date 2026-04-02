"use client";

import { useEffect, useState } from "react";

import { ProtectedRoute } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { api } from "@/lib/api";

type Batch = {
  id: number;
  batch_number: string;
  medicine_name: string;
  sku: string;
  quantity: number;
  manufacture_date: string;
  expiry_date: string;
  status: "created" | "in_transit" | "dispensed";
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  created:    "bg-sky-50 text-sky-700",
  in_transit: "bg-amber-50 text-amber-700",
  dispensed:  "bg-emerald-50 text-emerald-700",
};

const STATUS_LABELS: Record<string, string> = {
  created:    "Created",
  in_transit: "In Transit",
  dispensed:  "Dispensed",
};

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [error, setError]   = useState("");

  useEffect(() => {
    api.get("/api/batches")
      .then((r) => setBatches(r.data.batches))
      .catch(() => setError("Unable to load batches."));
  }, []);

  const counts = {
    total:      batches.length,
    in_transit: batches.filter((b) => b.status === "in_transit").length,
    dispensed:  batches.filter((b) => b.status === "dispensed").length,
  };

  return (
    <ProtectedRoute>
      <section className="space-y-6">
        <div className="rounded-2xl bg-secondary p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Tracking</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">Batch Management</h1>
          <p className="mt-3 text-sm text-ink-muted">
            Monitor active batches through the supply chain — from manufacturer dispatch to pharmacy delivery.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Batches",  value: counts.total },
            { label: "In Transit",     value: counts.in_transit },
            { label: "Dispensed",      value: counts.dispensed },
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
                <th className="px-5 py-4 font-medium">Batch Number</th>
                <th className="px-5 py-4 font-medium">Medicine</th>
                <th className="px-5 py-4 font-medium">Quantity</th>
                <th className="px-5 py-4 font-medium">Manufacture Date</th>
                <th className="px-5 py-4 font-medium">Expiry Date</th>
                <th className="px-5 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-ink-muted">Loading…</td>
                </tr>
              ) : (
                batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-mono text-xs font-medium text-ink">{b.batch_number}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{b.medicine_name}</p>
                      <p className="text-xs text-ink-muted mt-0.5">{b.sku}</p>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{b.quantity.toLocaleString()}</td>
                    <td className="px-5 py-4 text-ink-muted">
                      {new Date(b.manufacture_date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {new Date(b.expiry_date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[b.status]}`}>
                        {STATUS_LABELS[b.status]}
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
