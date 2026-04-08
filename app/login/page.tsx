import { Suspense } from "react";

import { LoginPageClient } from "@/components/login-page-client";

type LoginPageProps = {
  searchParams?: {
    next?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <LoginPageClient nextPath={searchParams?.next} />
    </Suspense>
  );
}
