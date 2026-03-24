"use client";

import { useEffect, useMemo, useState } from "react";

import { ProtectedRoute } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

type StakeholderRecord = {
  id: number;
  role: string;
  name: string;
  email: string;
  license_number: string;
  certificate_status: string;
};

const emptyForm = {
  name: "",
  role: "manufacturer",
  email: "",
  password: "",
  license_number: "",
};

export default function AdminStakeholdersPage() {
  const [stakeholders, setStakeholders] = useState<StakeholderRecord[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "role">("name");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState(emptyForm);
  const [error, setError] = useState("");

  async function loadStakeholders() {
    try {
      const response = await api.get("/api/stakeholders");
      setStakeholders(response.data.stakeholders);
    } catch {
      setError("Unable to load stakeholders.");
    }
  }

  useEffect(() => {
    loadStakeholders();
  }, []);

  const filteredStakeholders = useMemo(() => {
    return [...stakeholders]
      .filter((stakeholder) => {
        const term = search.toLowerCase();
        return (
          stakeholder.name.toLowerCase().includes(term) ||
          stakeholder.email.toLowerCase().includes(term) ||
          stakeholder.role.toLowerCase().includes(term)
        );
      })
      .sort((left, right) => left[sortBy].localeCompare(right[sortBy]));
  }, [search, sortBy, stakeholders]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await api.post("/api/stakeholders", formState);
      setFormState(emptyForm);
      setIsDialogOpen(false);
      await loadStakeholders();
    } catch {
      setError("Unable to register stakeholder.");
    }
  }

  return (
    <ProtectedRoute roles={["central_authority"]}>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[2rem] bg-secondary p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/55">Stakeholder Registry</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">Register and manage stakeholders</h1>
            <p className="mt-3 max-w-2xl text-sm text-ink/70">
              Search and sort the stakeholder directory, then open the registration dialog for new
              manufacturers, distributors, pharmacies, and doctors.
            </p>
          </div>

          <Button onClick={() => setIsDialogOpen(true)}>Register stakeholder</Button>
        </div>

        {error ? <Alert>{error}</Alert> : null}

        <div className="grid gap-4 rounded-[2rem] border border-border bg-white/80 p-5 md:grid-cols-[1fr_180px]">
          <Input
            placeholder="Search by name, email, or role"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-ink shadow-sm outline-none"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as "name" | "role")}
          >
            <option value="name">Sort by name</option>
            <option value="role">Sort by role</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-border bg-white/85 shadow-sm">
          <table className="min-w-full divide-y divide-border text-left text-sm">
            <thead className="bg-slate-50 text-ink/70">
              <tr>
                <th className="px-5 py-4 font-medium">Name</th>
                <th className="px-5 py-4 font-medium">Role</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">License</th>
                <th className="px-5 py-4 font-medium">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStakeholders.map((stakeholder) => (
                <tr key={stakeholder.id}>
                  <td className="px-5 py-4 font-medium text-ink">{stakeholder.name}</td>
                  <td className="px-5 py-4 capitalize text-ink/70">{stakeholder.role}</td>
                  <td className="px-5 py-4 text-ink/70">{stakeholder.email}</td>
                  <td className="px-5 py-4 text-ink/70">{stakeholder.license_number}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                      {stakeholder.certificate_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isDialogOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
            <div className="w-full max-w-xl rounded-[2rem] border border-border bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-ink/50">New Stakeholder</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">Issue credentials</h2>
                </div>

                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>

              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, name: event.target.value }))
                    }
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-ink shadow-sm outline-none"
                      value={formState.role}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, role: event.target.value }))
                      }
                    >
                      <option value="manufacturer">Manufacturer</option>
                      <option value="distributor">Distributor</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="doctor">Doctor</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="license_number">License number</Label>
                    <Input
                      id="license_number"
                      value={formState.license_number}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          license_number: event.target.value.toUpperCase(),
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
                    <Label htmlFor="password">Temporary password</Label>
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

                <Button type="submit">Register stakeholder</Button>
              </form>
            </div>
          </div>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}
