"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f7] px-6 text-center">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#c9a87c]">
        Something went wrong
      </p>
      <h1 className="mb-4 text-2xl font-light tracking-tight text-[#1c1a17]">
        An unexpected error occurred
      </h1>
      <p className="mb-8 max-w-md text-base text-[#6b5e4e]">
        We&rsquo;re sorry for the inconvenience. Please try again, or return to
        the homepage.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button size="md" variant="primary" onClick={reset}>
          Try again
        </Button>
        <Link href="/">
          <Button size="md" variant="secondary">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
