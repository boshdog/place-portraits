import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CreateForm } from "./CreateForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Preview — Place Portraits",
  description: "Upload your house photo and preview a personalised artwork before you buy.",
};

export default function CreatePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-12 md:py-20">
        <div className="mx-auto max-w-2xl px-6">
          {/* Page header */}
          <div className="mb-10">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#c9a87c]">
              Step 1 of 1
            </p>
            <h1 className="mb-3 text-3xl font-light tracking-tight text-[#1c1a17]">
              Create your artwork preview
            </h1>
            <p className="text-base leading-relaxed text-[#6b5e4e]">
              Upload a photo of your home, choose your artwork style and we&rsquo;ll
              create a personalised preview for you to approve before you buy.
            </p>
          </div>

          {/* Expectation note */}
          <div className="mb-8 rounded-sm border border-[#e5ddd0] bg-[#faf6f0] px-4 py-4">
            <p className="text-sm leading-relaxed text-[#6b4f3a]">
              <strong>What to expect:</strong> Your artwork will be a beautified
              interpretation of your home based on your photo. It is designed to
              be recognisable and giftable — not a technical architectural drawing.
            </p>
          </div>

          <CreateForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
