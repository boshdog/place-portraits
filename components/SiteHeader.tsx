import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e5ddd0] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-base font-medium tracking-wide text-[#3d2c1e] hover:text-[#6b4f3a]"
        >
          Place Portraits
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/#how-it-works"
            className="text-sm text-[#6b5e4e] hover:text-[#3d2c1e] transition-colors"
          >
            How it works
          </Link>
          <Link
            href="/#examples"
            className="text-sm text-[#6b5e4e] hover:text-[#3d2c1e] transition-colors"
          >
            Examples
          </Link>
          <Link
            href="/#products"
            className="text-sm text-[#6b5e4e] hover:text-[#3d2c1e] transition-colors"
          >
            Pricing
          </Link>
        </nav>
        <Link href="/create">
          <Button size="sm" variant="primary">
            Create Your Preview
          </Button>
        </Link>
      </div>
    </header>
  );
}
