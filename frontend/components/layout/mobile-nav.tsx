"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { navigationLinks } from "@/components/layout/navigation";
import { NavLink } from "@/components/layout/nav-link";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button
        variant="secondary"
        size="sm"
        className="rounded-full"
        onClick={() => setIsOpen((value) => !value)}
      >
        {isOpen ? <X className="mr-2 h-4 w-4" /> : <Menu className="mr-2 h-4 w-4" />}
        Menu
      </Button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-20 z-50 mx-4 rounded-[2rem] border border-border bg-white/95 p-4 shadow-2xl backdrop-blur">
          <div className="grid gap-2">
            {navigationLinks.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                onNavigate={() => setIsOpen(false)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
