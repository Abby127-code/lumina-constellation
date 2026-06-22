import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Lumina Constellation',
  description:
    'How Lumina Constellation collects, uses, and protects your personal data, including email, name, birth information, and usage data. GDPR and CCPA compliant.',
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
          Privacy Policy
        </h1>
        <p className="text-xs text-purple-100/50 mb-8">
          Last updated: January 2025 · Effective for all Lumina Constellation products
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-purple-100/80">
          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              1. Introduction
            </h2>
            <p>
              Lumina Constellation (“we”, “us”, or “our”) operates a suite of
              seven independent digital products, including the AI Spiritual
              Companion (Vega), Kids Storybook (Andromeda), AI Directory
              (Polaris), Prompt Library (Sirius), Digital Memorial (Pleiades),
              Caregiver Support (Lyra), and Genealogy (Cassiopeia). This Privacy
              Policy explains what information we collect, how we use it, and the
              choices you have. By using any of our products, you consent to the
              practices described here.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              2. Information We Collect
            </h2>
            <p>We collect the following categories of personal information:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Account information:</strong> email address, display
                name, and password (stored as a one-way hash).
              </li>
              <li>
                <strong>Birth and profile information:</strong> date, time, and
                place of birth, gender, and timezone — used solely to generate
                astrology, numerology, and Bazi readings.
              </li>
              <li>
                <strong>Content you create:</strong> prompts, dream journals,
                memorial entries, family-atlas records, and caregiver logs.
              </li>
              <li>
                <strong>Usage data:</strong> pages visited, features used,
                device type, IP address, browser, and approximate location.
              </li>
              <li>
                <strong>Payment metadata:</strong> transaction ID and
                subscription status. We never store full card numbers; payment
                is processed by our PCI-compliant partner LianLian Pay.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              3. How We Use Your Information
            </h2>
            <p>We use your data to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Provide, personalize, and improve our products;</li>
              <li>
                Generate AI-powered readings, storybooks, and memorial content
                tailored to your inputs;
              </li>
              <li>Process subscription payments and manage your account;</li>
              <li>
                Communicate with you about product updates, security alerts, and
                support requests;
              </li>
              <li>
                Detect fraud, abuse, and violations of our Terms of Service;
              </li>
              <li>
                Comply with legal obligations and protect our rights.
              </li>
            </ul>
            <p className="mt-2">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              4. Third-Party Services
            </h2>
            <p>
              We share the minimum data necessary with trusted service
              providers:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>LianLian Pay:</strong> processes subscription payments.
                LianLian receives transaction metadata but not your birth
                information or reading content.
              </li>
              <li>
                <strong>Analytics providers:</strong> receive anonymized usage
                metrics to help us improve the products.
              </li>
              <li>
                <strong>AI model providers:</strong> receive your prompts and
                profile inputs solely to generate responses. These providers
                process data under their own privacy frameworks.
              </li>
              <li>
                <strong>Email and notification services:</strong> used to deliver
                transactional and marketing emails you have opted into.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              5. Data Retention
            </h2>
            <p>
              We retain your account and content for as long as your account is
              active. Birth information and reading history are retained to
              preserve continuity of your personal records. If you delete your
              account, we remove your personal data within 30 days, except where
              retention is required by law (for example, financial records kept
              for tax compliance) or to resolve disputes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              6. Your Rights (GDPR / CCPA)
            </h2>
            <p>
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Access the personal data we hold about you;</li>
              <li>Correct inaccurate or incomplete information;</li>
              <li>Delete your account and associated data;</li>
              <li>Export your data in a portable format;</li>
              <li>Object to or restrict certain processing;</li>
              <li>Withdraw consent at any time; and</li>
              <li>
                Lodge a complaint with your local data protection authority.
              </li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, email{' '}
              <a
                href="mailto:privacy@lumina.constellation"
                className="text-amber-300 hover:underline"
              >
                privacy@lumina.constellation
              </a>
              . We respond to verified requests within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              7. Data Security
            </h2>
            <p>
              We use industry-standard safeguards including TLS encryption in
              transit, hashed passwords, role-based access controls, and regular
              security reviews. No method of transmission or storage is
              completely secure, but we work to protect your data using
              reasonable commercial measures.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              8. Children’s Privacy
            </h2>
            <p>
              Our Kids Storybook (Andromeda) is designed to be used by parents
              or guardians on behalf of children. We do not knowingly collect
              personal information directly from children under 13. If you
              believe a child has provided us with personal data, please contact
              us so we can delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Material
              changes will be announced by email and posted on this page with an
              updated revision date. Continued use after changes take effect
              constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              10. Contact Us
            </h2>
            <p>
              Questions about this Privacy Policy or your personal data? Contact
              our Data Protection team at{' '}
              <a
                href="mailto:privacy@lumina.constellation"
                className="text-amber-300 hover:underline"
              >
                privacy@lumina.constellation
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
