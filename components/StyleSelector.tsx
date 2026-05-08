"use client";

import { clsx } from "clsx";
import { ART_STYLES } from "@/lib/styles";
import type { ArtStyle } from "@/types";

interface StyleSelectorProps {
  value: ArtStyle | "";
  onChange: (style: ArtStyle) => void;
  error?: string;
}

export function StyleSelector({ value, onChange, error }: StyleSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-[#1c1a17]">
        Choose your artwork style{" "}
        <span className="text-red-600" aria-hidden>
          *
        </span>
      </legend>

      <div className="grid gap-3 sm:grid-cols-3">
        {ART_STYLES.map((style) => {
          const selected = value === style.key;
          return (
            <label
              key={style.key}
              className={clsx(
                "relative flex cursor-pointer flex-col rounded-sm border p-4 transition-all",
                selected
                  ? "border-[#3d2c1e] bg-[#3d2c1e] text-white"
                  : "border-[#e5ddd0] bg-white text-[#1c1a17] hover:border-[#c9a87c]"
              )}
            >
              <input
                type="radio"
                name="style"
                value={style.key}
                checked={selected}
                onChange={() => onChange(style.key)}
                className="sr-only"
              />
              <span className="mb-1 text-sm font-medium">{style.label}</span>
              <span
                className={clsx(
                  "text-xs leading-snug",
                  selected ? "text-[#e8d5b7]" : "text-[#8a7968]"
                )}
              >
                {style.description}
              </span>
              <div className="mt-3 flex gap-1.5">
                {style.moodWords.map((word) => (
                  <span
                    key={word}
                    className={clsx(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                      selected
                        ? "bg-white/20 text-white"
                        : "bg-[#f0ebe3] text-[#6b5e4e]"
                    )}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </label>
          );
        })}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </fieldset>
  );
}
