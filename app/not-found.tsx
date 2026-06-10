import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#c9a87c]">
            Page not found
          </p>
          <h1 className="mb-4 text-3xl font-light tracking-tight text-[#1c1a17]">
            This page doesn&rsquo;t exist
          </h1>
          <p className="mb-8 text-base text-[#6b5e4e]">
            The link may have expired or the address may be incorrect.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/">
              <Button size="md" variant="primary">Back to home</Button>
            </Link>
            <Link href="/create">
              <Button size="md" variant="secondary">Create a preview</Button>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
