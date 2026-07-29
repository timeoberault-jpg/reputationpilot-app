import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-mono" });

const FEATURES = [
  {
    label: "01",
    title: "Instant alerts",
    body: "Know the moment a review lands, especially the ones that need you fastest.",
  },
  {
    label: "02",
    title: "AI-drafted replies",
    body: "A reply written in your voice, ready to send in one copy-paste.",
  },
  {
    label: "03",
    title: "One dashboard",
    body: "Every review, one screen, no more logging into three different apps.",
  },
  {
    label: "04",
    title: "Site widget",
    body: "Show your best reviews on your own website to turn visitors into customers.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "$19",
    desc: "For a single location getting started.",
    features: ["Google reviews", "Instant alerts", "AI-drafted replies"],
  },
  {
    name: "Pro",
    price: "$39",
    desc: "For businesses that want the full picture.",
    features: ["Everything in Starter", "Facebook reviews", "Website widget", "Stats over time"],
    featured: true,
  },
];

export default function LandingPage() {
  return (
    <div className={`${fraunces.variable} ${inter.variable} ${mono.variable}`} style={{ fontFamily: "var(--font-body)" }}>
      {/* Nav */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span style={{ fontFamily: "var(--font-display)" }} className="text-lg font-medium text-[#14231D]">
          ReputationPilot
        </span>
        <nav className="flex items-center gap-6 text-sm text-[#6B6F6A]">
          <a href="#features" className="hidden hover:text-[#14231D] sm:inline">Features</a>
          <a href="#pricing" className="hidden hover:text-[#14231D] sm:inline">Pricing</a>
          <a href="/audit" className="hidden hover:text-[#14231D] sm:inline">Free audit</a>
          <a href="/login" className="hover:text-[#14231D]">Log in</a>
          <a
            href="/signup"
            className="rounded-md bg-[#0F6E56] px-4 py-2 text-white hover:bg-[#085041]"
          >
            Start free trial
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p style={{ fontFamily: "var(--font-mono)" }} className="mb-4 text-xs uppercase tracking-wide text-[#0F6E56]">
            For local businesses
          </p>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-4xl leading-tight text-[#14231D] md:text-5xl"
          >
            Turn today's review into tomorrow's customer.
          </h1>
          <p className="mt-5 text-lg text-[#6B6F6A]">
            ReputationPilot watches Google and Facebook for new reviews, drafts
            a reply in your voice, and puts your best feedback on your
            website — all from one dashboard.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <a
              href="/signup"
              className="rounded-md bg-[#0F6E56] px-5 py-3 text-sm font-medium text-white hover:bg-[#085041]"
            >
              Start your 14-day free trial
            </a>
            <span className="text-sm text-[#6B6F6A]">No credit card required</span>
          </div>
        </div>

        {/* Signature element: before / after */}
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <div className="flex-1 rounded-lg border border-[#E5E3DC] bg-[#FAFAF8] p-4 opacity-70 grayscale">
            <p style={{ fontFamily: "var(--font-mono)" }} className="mb-2 text-xs text-[#6B6F6A]">Before</p>
            <p className="text-sm font-medium text-[#14231D]">Maria K. ★★</p>
            <p className="mt-1 text-sm text-[#6B6F6A]">
              Waited 40 minutes, no one greeted us at the counter.
            </p>
            <p className="mt-3 text-xs text-[#6B6F6A]">No reply · 6 days ago</p>
          </div>
          <div className="flex-1 rounded-lg border border-[#0F6E56]/30 bg-white p-4 shadow-sm">
            <p style={{ fontFamily: "var(--font-mono)" }} className="mb-2 text-xs text-[#0F6E56]">After ReputationPilot</p>
            <p className="text-sm font-medium text-[#14231D]">Maria K. ★★</p>
            <p className="mt-1 text-sm text-[#6B6F6A]">
              Waited 40 minutes, no one greeted us at the counter.
            </p>
            <p className="mt-3 rounded bg-[#0F6E56]/10 p-2 text-sm text-[#085041]">
              Hi Maria, I'm sorry we missed you — that's not the experience
              we aim for. Please reach out so I can make it right.
            </p>
            <p className="mt-2 text-xs text-[#0F6E56]">Replied · 4 minutes ago</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-[#E5E3DC] px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.label}>
              <p style={{ fontFamily: "var(--font-mono)" }} className="mb-2 text-xs text-[#0F6E56]">{f.label}</p>
              <h3 style={{ fontFamily: "var(--font-display)" }} className="mb-1.5 text-lg text-[#14231D]">
                {f.title}
              </h3>
              <p className="text-sm text-[#6B6F6A]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-[#E5E3DC] px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 style={{ fontFamily: "var(--font-display)" }} className="mb-2 text-3xl text-[#14231D]">
            Simple pricing
          </h2>
          <p className="mb-10 text-[#6B6F6A]">Cancel anytime. No setup fees.</p>
        </div>
        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border p-6 ${
                plan.featured ? "border-[#0F6E56] border-2" : "border-[#E5E3DC]"
              }`}
            >
              {plan.featured && (
                <span style={{ fontFamily: "var(--font-mono)" }} className="mb-3 inline-block rounded bg-[#0F6E56]/10 px-2 py-1 text-xs text-[#085041]">
                  Most popular
                </span>
              )}
              <h3 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#14231D]">
                {plan.name}
              </h3>
              <p style={{ fontFamily: "var(--font-mono)" }} className="mt-2 text-3xl text-[#14231D]">
                {plan.price}<span className="text-base text-[#6B6F6A]">/mo</span>
              </p>
              <p className="mt-2 text-sm text-[#6B6F6A]">{plan.desc}</p>
              <ul className="mt-4 flex flex-col gap-2 text-left text-sm text-[#14231D]">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-[#0F6E56]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href="/signup"
                className={`mt-6 block rounded-md px-4 py-2.5 text-center text-sm font-medium ${
                  plan.featured
                    ? "bg-[#0F6E56] text-white hover:bg-[#085041]"
                    : "border border-[#E5E3DC] text-[#14231D] hover:bg-[#FAFAF8]"
                }`}
              >
                Start free trial
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E3DC] px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 text-xs text-[#6B6F6A] sm:flex-row">
          <span>© {new Date().getFullYear()} ReputationPilot</span>
          <div className="flex gap-4">
            <a href="/login" className="hover:text-[#14231D]">Log in</a>
            <a href="#pricing" className="hover:text-[#14231D]">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
