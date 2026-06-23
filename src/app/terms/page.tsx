import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Lumina Constellation',
  description:
    'The terms and conditions governing your use of Lumina Constellation products, including subscriptions, payments, refunds, and acceptable use.',
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
          Terms of Service
        </h1>
        <p className="text-xs text-purple-100/50 mb-8">
          Last updated: January 2025 · Applies to all Lumina Constellation products
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-purple-100/80">
          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              These Terms of Service (“Terms”) govern your access to and use of
              the websites, mobile applications, and services operated by Lumina
              Constellation (collectively, the “Services”). By creating an
              account or otherwise using the Services, you agree to be bound by
              these Terms and our Privacy Policy. If you do not agree, you may
              not use the Services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              2. Eligibility and Account Registration
            </h2>
            <p>
              You must be at least 13 years old (or the age of digital consent
              in your jurisdiction) to create an account. Users under 18 require
              a parent or guardian’s permission. You agree to provide accurate,
              current, and complete information during registration and to keep
              your credentials confidential. You are responsible for all
              activity under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              3. Subscription Plans and Pricing
            </h2>
            <p>
              Lumina Constellation offers the following subscription options:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Free tier:</strong> three (3) uses per day across the
                constellation, with limited features.
              </li>
              <li>
                <strong>Monthly Pro:</strong> $4.99 per month, billed
                recurring.
              </li>
              <li>
                <strong>Annual Pro:</strong> $47.90 per year (a 20% savings
                versus monthly), billed annually.
              </li>
            </ul>
            <p className="mt-2">
              Prices are in USD and exclude applicable taxes, which are added at
              checkout where required by law. We may change pricing with at
              least 30 days’ notice; existing subscribers keep their current
              rate until the end of the current billing cycle.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              4. Payment and Billing
            </h2>
            <p>
              Subscription payments are processed by LianLian Pay, our
              authorized payment partner. By subscribing, you authorize LianLian
              to charge the selected payment method for recurring fees until you
              cancel. You can update your payment method or cancel anytime from
              your account settings; cancellations take effect at the end of the
              current billing period and no further charges will be made.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              5. Refund Policy
            </h2>
            <p>
              We offer a 7-day money-back guarantee on first-time paid
              subscriptions. If you are not satisfied within seven (7) days of
              your initial purchase, contact{' '}
              <a
                href="mailto:support@dealcanny.com"
                className="text-amber-300 hover:underline"
              >
                support@dealcanny.com
              </a>{' '}
              with your order ID for a full refund. Refunds for renewals or
              after the 7-day window are evaluated case by case and are not
              guaranteed. Abuse of the refund policy may result in account
              suspension.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              6. Acceptable Use and Prohibited Conduct
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Use the Services for any unlawful or fraudulent purpose;</li>
              <li>
                Attempt to access, tamper with, or reverse-engineer our systems,
                models, or content;
              </li>
              <li>
                Scrape, crawl, or otherwise extract bulk data from the Services;
              </li>
              <li>
                Submit content that is hateful, harassing, defamatory, sexually
                explicit, or that infringes another’s rights;
              </li>
              <li>
                Use the Services to generate content that could harm minors or
                vulnerable individuals;
              </li>
              <li>
                Resell, sublicense, or redistribute access to the Services
                without our written permission.
              </li>
            </ul>
            <p className="mt-2">
              See our Disclaimer for important information about the
              entertainment nature of spiritual content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              7. Intellectual Property
            </h2>
            <p>
              The Services, including software, design, text, brand assets, and
              curated datasets, are the intellectual property of Lumina
              Constellation and its licensors. You retain ownership of the
              content you submit (such as prompts and memorial entries) and
              grant us a worldwide, non-exclusive license to use, host, and
              process that content solely to provide and improve the Services.
              AI-generated outputs may be used for personal, non-commercial
              purposes unless you hold an active commercial license.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              8. Disclaimer of Warranties
            </h2>
            <p>
              The Services are provided “as is” and “as available” without
              warranties of any kind. Spiritual, astrological, tarot, dream,
              and memorial content is provided for entertainment purposes only
              and is not medical, psychological, legal, or financial advice.
              See our full Disclaimer for details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              9. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Lumina Constellation and
              its affiliates shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, or any loss of
              profits or data, arising from your use of or inability to use the
              Services. Our total aggregate liability for any claim shall not
              exceed the amount you paid us in the 12 months preceding the
              claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              10. Termination
            </h2>
            <p>
              You may delete your account at any time. We may suspend or
              terminate your access if you violate these Terms, create legal
              risk, or engage in fraudulent activity. Upon termination, your
              right to use the Services ends immediately, and we may delete your
              content in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              11. Governing Law and Disputes
            </h2>
            <p>
              These Terms are governed by the laws of the jurisdiction in which
              Lumina Constellation is established, without regard to conflict of
              law principles. You agree to attempt to resolve disputes informally
              for at least 30 days before initiating formal proceedings. Any
              dispute that cannot be resolved informally will be submitted to
              binding arbitration, except for matters that may be taken to
              small-claims court.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              12. Changes to These Terms
            </h2>
            <p>
              We may revise these Terms periodically. Material changes will be
              posted with an updated “Last updated” date and, where required,
              communicated by email. Continued use after the effective date
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              13. Contact
            </h2>
            <p>
              Questions about these Terms? Email{' '}
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
