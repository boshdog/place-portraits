import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { BeforeAfterExamples } from "@/components/BeforeAfterExamples";
import { StylePreviewSection } from "@/components/StylePreviewSection";
import { TrustBadges } from "@/components/TrustBadges";
import { ProductOptionsSection } from "@/components/ProductOptionsSection";
import { Faq } from "@/components/Faq";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <BeforeAfterExamples />
        <StylePreviewSection />
        <TrustBadges />
        <ProductOptionsSection />
        <Faq />

        {/* Final CTA section */}
        <section className="bg-[#3d2c1e] py-20 text-center text-white">
          <div className="mx-auto max-w-xl px-6">
            <h2 className="mb-4 text-3xl font-light tracking-tight">
              Ready to see your home as beautiful framed art?
            </h2>
            <p className="mb-8 text-base text-[#e8d5b7]">
              Upload your photo and preview your personalised artwork before you
              buy. No commitment until you love it.
            </p>
            <Link href="/create">
              <Button
                size="lg"
                className="border-0 bg-white text-[#3d2c1e] hover:bg-[#e8d5b7]"
              >
                Create Your Preview
              </Button>
            </Link>
            <p className="mt-4 text-xs text-[#c9a87c]">
              Preview before you buy. Only order if you love it.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
