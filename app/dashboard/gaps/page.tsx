import { Suspense } from "react";

import { GapsPageClient } from "@/components/gaps-page-client";

type GapsPageProps = {
  searchParams?: {
    control?: string;
  };
};

export default function GapsPage({ searchParams }: GapsPageProps) {
  return (
    <Suspense fallback={<div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 text-sm text-[#888888]">Loading gaps...</div>}>
      <GapsPageClient initialControlFilter={searchParams?.control} />
    </Suspense>
  );
}
