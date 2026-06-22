import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Lumina Constellation',
  description:
    'Lumina Constellation is a suite of seven independent AI-native digital products. Our mission: eight stars guiding every dimension of your life. Founded 2025, AI-powered and human-centered.',
};

export default function Page() {
  return (
    <div className="min-h-screen bg-mystic-gradient text-purple-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <a
          href="/"
          className="text-amber-300 text-sm hover:underline mb-6 inline-block"
        >
          ← Back to Home
        </a>
        <h1
          className="text-3xl font-bold text-gold mb-2"
          style={{ fontFamily: 'var(--font-cormorant), serif' }}
        >
          About Lumina Constellation
        </h1>
        <p className="text-sm text-amber-200/80 mb-8 italic">
          “Eight stars guiding every dimension of your life.”
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-purple-100/80">
          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              Our Mission
            </h2>
            <p>
              Lumina Constellation is a suite of seven independent digital
              products, each named after a star and each illuminating a
              different dimension of modern life. Our mission is simple but
              ambitious: to be the eight stars — Vega, Andromeda, Polaris,
              Sirius, Pleiades, Lyra, Cassiopeia, and Orion — guiding every
              dimension of your life. Where traditional apps serve a single
              function, our constellation weaves together spirituality,
              storytelling, productivity, remembrance, caregiving, family
              history, and discovery into one cohesive sky.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              The Seven Products
            </h2>
            <p>
              Each product stands on its own, yet together they form a unified
              experience:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong className="text-amber-200">Vega</strong> — AI Spiritual
                Companion for astrology, tarot, dream interpretation, and
                numerology.
              </li>
              <li>
                <strong className="text-amber-200">Andromeda</strong> —
                personalized AI kids’ storybooks that spark imagination.
              </li>
              <li>
                <strong className="text-amber-200">Polaris</strong> — curated AI
                tools directory to help you find the right product.
              </li>
              <li>
                <strong className="text-amber-200">Sirius</strong> — a living
                library of high-quality AI prompts for creators and
                professionals.
              </li>
              <li>
                <strong className="text-amber-200">Pleiades</strong> — Digital
                Memorial for honoring and remembering loved ones.
              </li>
              <li>
                <strong className="text-amber-200">Lyra</strong> — Caregiver
                Support that helps families care for those they love.
              </li>
              <li>
                <strong className="text-amber-200">Cassiopeia</strong> —
                Genealogy and family-atlas storytelling that preserves your
                heritage.
              </li>
            </ul>
            <p className="mt-2">
              Together with the overarching Orion micro-SaaS layer, these seven
              products form the eighth guiding light — the constellation itself.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              AI-Powered, Human-Centered
            </h2>
            <p>
              Lumina Constellation was founded in 2025 with a clear belief:
              artificial intelligence should amplify human warmth, not replace
              it. Every product is built on cutting-edge generative AI, but each
              is designed around real human needs — the longing for meaning, the
              comfort of remembrance, the joy of a child’s bedtime story, the
              quiet courage of caregiving. We pair the speed and scale of AI
              with editorial care, cultural sensitivity, and a commitment to
              honest, transparent experiences.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              Built on Deep Market Research
            </h2>
            <p>
              Our constellation is not the result of guesswork. Before building,
              we conducted deep market research across{' '}
              <strong className="text-amber-200">
                240+ data points spanning 24 tracks
              </strong>
              , covering user behavior, competitive landscapes, pricing models,
              cultural nuances, and emerging AI capabilities. This evidence-led
              approach lets us prioritize features that genuinely matter,
              supports fair and sustainable pricing, and ensures that each
              product earns its place among the stars.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              Our Values
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Wonder with integrity</strong> — spiritual and creative
                products must be transparent and never mislead.
              </li>
              <li>
                <strong>Privacy by design</strong> — your personal stories,
                birth data, and memories belong to you.
              </li>
              <li>
                <strong>Accessibility</strong> — available in 7 languages and
                designed to be usable by everyone, everywhere.
              </li>
              <li>
                <strong>Continuous craft</strong> — we ship improvements weekly
                and listen closely to our community.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              Join the Constellation
            </h2>
            <p>
              Whether you are seeking reflection, raising curious kids,
              caring for a loved one, or simply exploring what AI can do for
              your everyday life, there is a star here for you. Begin with any
              product — they shine brightest when experienced together.
            </p>
            <p className="mt-3">
              <a
                href="/"
                className="inline-block px-5 py-2 rounded-full bg-gold/20 border border-amber-300/50 text-amber-200 hover:bg-gold/30 transition text-sm"
              >
                Explore the Constellation →
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
