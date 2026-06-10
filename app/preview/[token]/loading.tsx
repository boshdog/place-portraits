import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function PreviewLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#e5ddd0] bg-white">
            <svg className="h-6 w-6 animate-spin text-[#c9a87c]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
          </div>
          <div className="mx-auto h-6 w-64 animate-pulse rounded bg-[#e5ddd0]" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
