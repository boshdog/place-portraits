import type { PreviewStatus } from "@/types";

interface GeneratingStateProps {
  status: PreviewStatus;
  originalImageUrl?: string | null;
  styleName?: string;
}

export function GeneratingState({
  status,
  originalImageUrl,
  styleName,
}: GeneratingStateProps) {
  const isPending = status === "pending";
  const isFailed = status === "failed";

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      {isFailed ? (
        <>
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#e5ddd0] bg-white text-[#c9a87c]">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          </div>
          <h1 className="mb-3 text-xl font-light text-[#1c1a17]">
            We&rsquo;re putting the finishing touches on your preview
          </h1>
          <p className="text-base leading-relaxed text-[#6b5e4e]">
            Your artwork preview needs a quick manual check. We&rsquo;ll email
            you as soon as it&rsquo;s ready — usually within a few hours.
          </p>
        </>
      ) : (
        <>
          {/* Animated spinner */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#e5ddd0] bg-white">
            <svg
              className="h-6 w-6 animate-spin text-[#c9a87c]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
              />
            </svg>
          </div>

          <h1 className="mb-3 text-xl font-light text-[#1c1a17]">
            {isPending
              ? "Your artwork preview is waiting to be prepared"
              : "Your artwork preview is being created"}
          </h1>
          <p className="text-base leading-relaxed text-[#6b5e4e]">
            This usually takes a short moment. You can keep this page open or
            we&rsquo;ll email you when your preview is ready.
          </p>
        </>
      )}

      {/* Details */}
      <div className="mt-10 flex flex-col gap-3">
        {originalImageUrl && (
          <div className="rounded-sm border border-[#e5ddd0] bg-white p-4 text-left">
            <p className="mb-1 text-xs uppercase tracking-widest text-[#8a7968]">
              Your photo
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalImageUrl}
              alt="Your uploaded house photo"
              className="h-28 w-full rounded-sm object-cover"
            />
          </div>
        )}
        {styleName && (
          <div className="rounded-sm border border-[#e5ddd0] bg-white p-4 text-left">
            <p className="mb-0.5 text-xs uppercase tracking-widest text-[#8a7968]">
              Style
            </p>
            <p className="text-sm font-medium text-[#1c1a17]">{styleName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
