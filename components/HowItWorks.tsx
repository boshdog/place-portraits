const STEPS = [
  {
    number: "01",
    title: "Upload your house photo",
    body: "Share a clear daylight photo of the front of your property. We'll guide you on what makes a great photo.",
  },
  {
    number: "02",
    title: "Choose your artwork style",
    body: "Select from Classic Watercolour, Elegant Line & Wash, or Signature Illustrated — each a distinctive, premium look.",
  },
  {
    number: "03",
    title: "Preview your personalised design",
    body: "Receive a watermarked artwork preview created from your photo. See your home transformed before you commit.",
  },
  {
    number: "04",
    title: "Order as a print, frame or digital file",
    body: "Love your preview? Choose your size and finish — framed, unframed, or a high-resolution digital file.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        {/* Heading */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#c9a87c]">
            How it works
          </p>
          <h2 className="text-3xl font-light tracking-tight text-[#1c1a17] md:text-4xl">
            From photo to framed artwork in four steps
          </h2>
        </div>

        {/* Steps */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col">
              <span className="mb-3 text-3xl font-light text-[#c9a87c]">
                {step.number}
              </span>
              <h3 className="mb-2 text-base font-medium text-[#1c1a17]">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#6b5e4e]">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
