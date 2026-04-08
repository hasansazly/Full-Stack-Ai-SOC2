import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      critical: "bg-red-500/15 text-red-300 ring-1 ring-red-500/20",
      high: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/20",
      medium: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20",
      low: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20",
      neutral: "bg-white/10 text-slate-300 ring-1 ring-white/10"
    }
  },
  defaultVariants: {
    variant: "neutral"
  }
});

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
