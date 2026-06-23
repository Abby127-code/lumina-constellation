import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Lumina Constellation',
  description:
    'How Lumina Constellation uses cookies and similar technologies, the types of cookies we set, and how you can manage or disable them.',
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
          Cookie Policy
        </h1>
        <p className="text-xs text-purple-100/50 mb-8">
          Last updated: January 2025 · Applies to all Lumina Constellation websites and apps
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-purple-100/80">
          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files placed on your device when you visit a
              website. They allow the site to remember your actions and
              preferences over time, enabling features such as login sessions,
              language selection, and analytics. Lumina Constellation uses
              cookies and similar technologies (such as local storage and pixel
              tags) to operate and improve our products.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              2. Types of Cookies We Use
            </h2>
            <p>We categorize the cookies we use into three groups:</p>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>
                <strong className="text-amber-200">
                  Essential cookies:
                </strong>{' '}
                required for core functionality such as authentication,
                security, and load balancing. These cannot be disabled without
                breaking key features of the Services.
              </li>
              <li>
                <strong className="text-amber-200">
                  Analytics cookies:
                </strong>{' '}
                help us understand how visitors use our products so we can
                improve performance and design. These cookies collect
                aggregated, anonymized data about pages visited and features
                used.
              </li>
              <li>
                <strong className="text-amber-200">
                  Preference cookies:
                </strong>{' '}
                remember your settings — such as theme (light/dark), language,
                and accessibility preferences — so you don’t have to reconfigure
                them on each visit.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              3. Third-Party Cookies
            </h2>
            <p>
              Some cookies are set by third-party services we work with,
              including:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Payment provider (LianLian Pay):</strong> sets
                session and fraud-prevention cookies during the checkout flow.
              </li>
              <li>
                <strong>Analytics providers:</strong> may set cookies to measure
                traffic and product engagement.
              </li>
              <li>
                <strong>AI model providers:</strong> may set technical cookies
                needed to deliver generated content.
              </li>
            </ul>
            <p className="mt-2">
              These third parties govern their own cookies under their respective
              privacy policies. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              4. Managing Cookies
            </h2>
            <p>
              You have several options for managing cookies:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                Use our in-app cookie preference center to accept or reject
                non-essential cookies.
              </li>
              <li>
                Configure your browser to accept, block, or delete cookies. Most
                browsers offer detailed cookie controls in their settings or
                preferences menu.
              </li>
              <li>
                Use private or “incognito” browsing modes, which limit cookie
                persistence.
              </li>
              <li>
                Opt out of interest-based advertising through industry tools
                such as the Digital Advertising Alliance opt-out page.
              </li>
            </ul>
            <p className="mt-2">
              Please note that disabling essential cookies may prevent you from
              logging in, completing purchases, or using certain features.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              5. Cookie Retention
            </h2>
            <p>
              Cookie retention varies by type. Session cookies are deleted when
              you close your browser. Persistent cookies remain on your device
              for a set period — typically between 30 days and 13 months — after
              which they expire automatically. You can clear persistent cookies
              at any time through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              6. Consent
            </h2>
            <p>
              Where required by law (for example under the EU ePrivacy
              Directive or GDPR), we ask for your consent before setting
              non-essential cookies. You can withdraw or change your consent at
              any time via our cookie preference center or by clearing cookies
              in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              7. Updates to This Policy
            </h2>
            <p>
              We may update this Cookie Policy as we add new features or change
              service providers. Material changes will be posted on this page
              with a revised “Last updated” date and, where required, presented
              for renewed consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              8. Contact
            </h2>
            <p>
              Questions about our use of cookies? Email{' '}
              <a
                href="mailto:support@dealcanny.com"
                className="text-amber-300 hover:underline"
              >
                support@dealcanny.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
