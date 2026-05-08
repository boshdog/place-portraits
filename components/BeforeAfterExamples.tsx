/**
 * TODO: Replace placeholder cards with real before/after artwork examples.
 * Each card shows: original photo → watermarked artwork preview → framed mockup.
 * Recommended image size: ~800×600px for artwork, ~600×800px for framed mockup.
 */

export function BeforeAfterExamples() {
  const examples = [
    { style: "Classic Watercolour", accent: "#c9a87c" },
    { style: "Elegant Line & Wash", accent: "#8a7968" },
    { style: "Signature Illustrated", accent: "#6b4f3a" },
  ];

  return (
    <section id="examples" className="bg-[#faf9f7] py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        {/* Heading */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#c9a87c]">
            See the results
          </p>
          <h2 className="text-3xl font-light tracking-tight text-[#1c1a17] md:text-4xl">
            A beautiful artwork of the place that means everything
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#6b5e4e]">
            Each artwork is created from your own photo — a meaningful keepsake
            designed to be recognisable, giftable and beautiful on any wall.
          </p>
        </div>

        {/* Example cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {examples.map((ex) => (
            <div
              key={ex.style}
              className="overflow-hidden rounded-sm border border-[#e5ddd0] bg-white"
            >
              {/* Before: original photo placeholder */}
              <div className="relative aspect-[4/3] bg-[#f0ebe3] flex items-center justify-center">
                <div className="text-center px-4">
                  <p className="text-xs uppercase tracking-widest text-[#8a7968] mb-1">
                    Original photo
                  </p>
                  {/* TODO: Replace with real before photo */}
                  <p className="text-xs text-[#c9a87c]">Example coming soon</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center py-3 bg-white border-y border-[#e5ddd0]">
                <svg
                  className="h-4 w-4 text-[#c9a87c]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </div>

              {/* After: artwork preview placeholder */}
              <div className="relative aspect-[4/3] bg-[#e8d5b7] flex items-center justify-center">
                <div className="text-center px-4">
                  <p
                    className="text-xs uppercase tracking-widest mb-1"
                    style={{ color: ex.accent }}
                  >
                    {ex.style}
                  </p>
                  {/* TODO: Replace with real artwork example */}
                  <p className="text-xs text-[#8a7968]">Artwork example coming soon</p>
                </div>
                {/* Watermark indicator */}
                <div className="absolute bottom-2 right-2 rounded px-1.5 py-0.5 bg-black/40 text-white text-[9px] uppercase tracking-wider">
                  Preview
                </div>
              </div>

              {/* Style label */}
              <div className="px-4 py-3 text-center">
                <p className="text-xs font-medium text-[#3d2c1e]">{ex.style}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-[#8a7968]">
          {/* TODO: Remove this line when real examples are added */}
          Real artwork examples will be added once first orders are fulfilled.
        </p>
      </div>
    </section>
  );
}
