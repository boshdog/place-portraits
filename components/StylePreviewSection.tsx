import Link from "next/link";
import { ART_STYLES } from "@/lib/styles";
import { Button } from "@/components/ui/Button";

export function StylePreviewSection() {
  return (
    <section id="styles" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#c9a87c]">
            Artwork styles
          </p>
          <h2 className="text-3xl font-light tracking-tight text-[#1c1a17] md:text-4xl">
            Choose the look that suits you
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-[#6b5e4e]">
            Each style is designed to make your home look beautiful, premium and
            giftable on any wall.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {ART_STYLES.map((style) => (
            <div
              key={style.key}
              className="rounded-sm border border-[#e5ddd0] bg-[#faf9f7] p-6"
            >
              {/* Placeholder artwork swatch — TODO: replace with real style examples */}
              <div className="mb-4 aspect-[4/3] rounded-sm bg-gradient-to-br from-[#e8d5b7] to-[#c9a87c]" />

              <p className="mb-1 text-sm font-medium text-[#1c1a17]">
                {style.label}
              </p>
              <p className="mb-3 text-xs leading-relaxed text-[#6b5e4e]">
                {style.description}
              </p>
              <div className="flex gap-1.5">
                {style.moodWords.map((word) => (
                  <span
                    key={word}
                    className="rounded-full bg-white border border-[#e5ddd0] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#6b5e4e]"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/create">
            <Button size="lg" variant="primary">
              Create Your Preview
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
