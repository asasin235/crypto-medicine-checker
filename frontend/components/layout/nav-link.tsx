"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onNavigate?: () => void;
};

export function NavLink({ href, label, icon: Icon, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
        isActive
          ? "bg-accent text-white shadow-glow"
          : "text-ink/75 hover:bg-white/80 hover:text-ink"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
