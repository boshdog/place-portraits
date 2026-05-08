"use client";

import { useState } from "react";
import { clsx } from "clsx";

const FAQS = [
  {
    q: "What photo should I upload?",
    a: "Upload a clear, daylight photo of the front of your property. Portrait or landscape orientation is fine. The more clearly we can see the house — roofline, door, windows — the more recognisable your artwork will be. Avoid night photos, heavily obscured views, or very small thumbnails.",
  },
  {
    q: "Is the artwork an exact architectural drawing?",
    a: "No. Your artwork will be a beautified, artistic interpretation of your home based on your photo. It is designed to be recognisable and giftable — preserving the roofline, door, windows and key features — but it is not a technical architectural drawing.",
  },
  {
    q: "Can I request changes to my preview?",
    a: "Yes. One minor revision is included with every order. Once you've seen your preview, you can request a small adjustment — for example, removing a car, adjusting a colour, or softening the background.",
  },
  {
    q: "Can I buy framed or unframed?",
    a: "Both. You can choose from a digital file, unframed fine art prints in A5, A4 and A3, or beautifully framed keepsake prints in A5, A4 and A3.",
  },
  {
    q: "What happens after I order?",
    a: "Once your order is placed, we prepare your final artwork for print. You'll receive a confirmation email, and we'll keep you updated as your order is prepared and dispatched.",
  },
  {
    q: "Can I use a Google Maps or Street View link instead of a photo?",
    a: "Yes — you can provide an optional Google Maps or Street View link alongside your photo. This helps us understand the exact location and orientation of your home if the photo doesn't fully capture it.",
  },
  {
    q: "What happens if the preview needs adjustment?",
    a: "If your preview needs a manual check or small fix, we'll let you know by email. We'll send you the updated preview as soon as it's ready.",
  },
  {
    q: "Will my preview be watermarked?",
    a: "Yes. Your preview will include a watermark. Once you place an order, you'll receive the final unwatermarked, print-ready artwork.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-[#faf9f7] py-20 md:py-28">
      <div className="mx-auto max-w-2xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#c9a87c]">
            Questions
          </p>
          <h2 className="text-3xl font-light tracking-tight text-[#1c1a17]">
            Frequently asked questions
          </h2>
        </div>

        <div className="divide-y divide-[#e5ddd0]">
          {FAQS.map((faq, i) => (
            <div key={i} className="py-4">
              <button
                className="flex w-full items-start justify-between gap-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="text-sm font-medium text-[#1c1a17]">
                  {faq.q}
                </span>
                <svg
                  className={clsx(
                    "mt-0.5 h-4 w-4 shrink-0 text-[#c9a87c] transition-transform",
                    open === i && "rotate-180"
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <p className="mt-3 text-sm leading-relaxed text-[#6b5e4e]">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
