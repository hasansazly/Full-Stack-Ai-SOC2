"use client";

import Link from "next/link";

import { captureEvent } from "@/lib/analytics";
import { Button, type ButtonProps } from "@/components/ui/button";

type Props = ButtonProps & {
  href: string;
  event: string;
  properties?: Record<string, unknown>;
  children: React.ReactNode;
};

export function TrackedLinkButton({ href, event, properties, children, ...props }: Props) {
  const isExternal = href.startsWith("mailto:") || href.startsWith("http");

  if (isExternal) {
    return (
      <Button
        {...props}
        onClick={() => {
          captureEvent(event, properties);
          window.location.href = href;
        }}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button asChild {...props}>
      <Link
        href={href}
        onClick={() => {
          captureEvent(event, properties);
        }}
      >
        {children}
      </Link>
    </Button>
  );
}
