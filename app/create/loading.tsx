import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function CreateLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-12 md:py-20">
        <div className="mx-auto max-w-2xl animate-pulse px-6">
          <div className="mb-10">
            <div className="mb-2 h-3 w-24 rounded bg-[#e5ddd0]" />
            <div className="mb-3 h-8 w-64 rounded bg-[#e5ddd0]" />
            <div className="h-4 w-96 rounded bg-[#e5ddd0]" />
          </div>
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-10 rounded-sm bg-[#e5ddd0]" />
              <div className="h-10 rounded-sm bg-[#e5ddd0]" />
            </div>
            <div className="h-40 rounded-sm border-2 border-dashed border-[#e5ddd0] bg-[#faf9f7]" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="h-28 rounded-sm bg-[#e5ddd0]" />
              <div className="h-28 rounded-sm bg-[#e5ddd0]" />
              <div className="h-28 rounded-sm bg-[#e5ddd0]" />
            </div>
            <div className="h-12 w-48 rounded-sm bg-[#e5ddd0]" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
