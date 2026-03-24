import type { LabelHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium tracking-[0.02em] text-ink/75", className)}
      {...props}
    />
  );
}
