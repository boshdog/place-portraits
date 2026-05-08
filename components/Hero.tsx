import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#faf9f7] py-20 md:py-32">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 70% 50%, #e8d5b7 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Badge */}
        <p className="mb-6 inline-block rounded-full border border-[#c9a87c] px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#6b4f3a]">
          Personalised Home Artwork
        </p>

        {/* Headline */}
        <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-light leading-tight tracking-tight text-[#1c1a17] md:text-6xl">
          Turn your home into{" "}
          <em className="not-italic text-[#3d2c1e]">beautiful framed art</em>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-[#6b5e4e]">
          Upload a photo of your house and preview a personalised artwork before
          you buy.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/create">
            <Button size="lg" variant="primary">
              Create Your Preview
            </Button>
          </Link>
          <a href="#examples">
            <Button size="lg" variant="secondary">
              See Examples
            </Button>
          </a>
        </div>

        {/* Trust line */}
        <p className="mt-8 text-sm text-[#8a7968]">
          Preview before you buy. Only order if you love it.
        </p>

        {/* Decorative rule */}
        <div className="mx-auto mt-16 h-px w-24 bg-[#c9a87c]" />
      </div>
    </section>
  );
}
