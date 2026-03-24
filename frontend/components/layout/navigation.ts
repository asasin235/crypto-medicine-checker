import {
  Activity,
  BadgeCheck,
  ClipboardList,
  Factory,
  LayoutDashboard,
  PackageSearch,
  Pill,
  ReceiptText,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";

export const navigationLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard", label: "Admin", icon: BadgeCheck },
  { href: "/admin/stakeholders", label: "Manage Stakeholders", icon: Factory },
  { href: "/login", label: "Login", icon: ShieldCheck },
  { href: "/register", label: "Register", icon: Activity },
  { href: "/stakeholders", label: "Stakeholders", icon: Factory },
  { href: "/patients", label: "Patients", icon: Activity },
  { href: "/medicines", label: "Medicines", icon: Pill },
  { href: "/batches", label: "Batches", icon: PackageSearch },
  { href: "/prescriptions", label: "Prescriptions", icon: ReceiptText },
  { href: "/ledger", label: "Ledger", icon: ClipboardList },
  { href: "/verification", label: "Verification", icon: ScanSearch },
];
