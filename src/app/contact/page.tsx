import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Lumina Constellation',
  description:
    'Get in touch with Lumina Constellation. Email support, privacy, and press inquiries, or send us a message through our contact form.',
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
          Contact Us
        </h1>
        <p className="text-sm text-purple-100/70 mb-8">
          We’d love to hear from you. Reach out with questions, feedback, or
          partnership ideas — our team responds within two business days.
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-purple-100/80">
          {/* Email directory */}
          <section className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gold mb-3">
              Email Directory
            </h2>
            <ul className="space-y-3">
              <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span>
                  <strong className="text-amber-200">General support:</strong>{' '}
                  account, billing, refunds, and product help.
                </span>
                <a
                  href="mailto:support@dealcanny.com"
                  className="text-amber-300 hover:underline sm:text-right"
                >
                  support@dealcanny.com
                </a>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span>
                  <strong className="text-amber-200">Privacy &amp; data:</strong>{' '}
                  GDPR, CCPA, and data deletion requests.
                </span>
                <a
                  href="mailto:support@dealcanny.com"
                  className="text-amber-300 hover:underline sm:text-right"
                >
                  support@dealcanny.com
                </a>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span>
                  <strong className="text-amber-200">Press &amp; partnerships:</strong>{' '}
                  media inquiries and collaborations.
                </span>
                <a
                  href="mailto:support@dealcanny.com"
                  className="text-amber-300 hover:underline sm:text-right"
                >
                  support@dealcanny.com
                </a>
              </li>
            </ul>
          </section>

          {/* Contact form (mailto:) */}
          <section className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gold mb-1">
              Send a Message
            </h2>
            <p className="text-xs text-purple-100/60 mb-4">
              Submitting this form opens your email client with the message
              pre-filled, addressed to our support team.
            </p>
            <form
              action="mailto:support@dealcanny.com"
              method="post"
              encType="text/plain"
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs uppercase tracking-wider text-amber-200/80 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full rounded-lg bg-night/60 border border-amber-300/30 px-3 py-2 text-sm text-purple-100 placeholder:text-purple-100/40 focus:outline-none focus:border-amber-300/70"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs uppercase tracking-wider text-amber-200/80 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg bg-night/60 border border-amber-300/30 px-3 py-2 text-sm text-purple-100 placeholder:text-purple-100/40 focus:outline-none focus:border-amber-300/70"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-xs uppercase tracking-wider text-amber-200/80 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full rounded-lg bg-night/60 border border-amber-300/30 px-3 py-2 text-sm text-purple-100 placeholder:text-purple-100/40 focus:outline-none focus:border-amber-300/70 resize-y"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gold/20 border border-amber-300/50 text-amber-200 hover:bg-gold/30 transition text-sm font-medium"
              >
                Send Message
              </button>
            </form>
          </section>

          {/* Social links */}
          <section className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gold mb-3">
              Connect With Us
            </h2>
            <p className="text-xs text-purple-100/60 mb-4">
              Follow the constellation across social platforms for updates,
              readings, and behind-the-scenes content.
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <li>
                <a
                  href="#"
                  className="block px-3 py-2 rounded-lg bg-night/50 border border-amber-300/20 hover:border-amber-300/50 text-center text-amber-200 transition"
                >
                  X / Twitter
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-3 py-2 rounded-lg bg-night/50 border border-amber-300/20 hover:border-amber-300/50 text-center text-amber-200 transition"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-3 py-2 rounded-lg bg-night/50 border border-amber-300/20 hover:border-amber-300/50 text-center text-amber-200 transition"
                >
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-3 py-2 rounded-lg bg-night/50 border border-amber-300/20 hover:border-amber-300/50 text-center text-amber-200 transition"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gold mb-2">
              Response Times
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                General support: within 2 business days.
              </li>
              <li>
                Privacy and data requests: within 30 days, as required by GDPR
                and CCPA.
              </li>
              <li>
                Press inquiries: within 1 business day.
              </li>
            </ul>
            <p className="mt-3 text-xs text-purple-100/60">
              For urgent matters such as account security, please use the
              subject line “URGENT” in your email so we can prioritize it.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
