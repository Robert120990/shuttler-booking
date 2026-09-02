import { SEO } from '../components/seo/SEO';

export const PrivacyPage = () => (
  <div className="bg-slate-50 min-h-screen py-12">
    <SEO
      title="Privacy Policy"
      description="Learn how Trail Explorer collects, uses and protects your personal information when you use our shuttle booking platform."
      path="/privacy"
    />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: January 2026</p>
      </div>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
          <p className="text-slate-600 leading-relaxed">
            We collect information you provide directly, including your name, email address, phone number, and payment
            information when you book a shuttle or create an account. We also automatically collect device information,
            usage data, and cookies to improve our service.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
          <p className="text-slate-600 leading-relaxed">
            We use your information to process bookings, send confirmation emails, provide customer support, improve our
            platform, and communicate promotional offers you have opted into. We never sell your personal data to third parties.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Data Sharing</h2>
          <p className="text-slate-600 leading-relaxed">
            We share necessary booking details with transportation service providers to fulfill your reservation. Payment
            processing is handled by our secure payment partners. We may disclose information if required by law.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Data Security</h2>
          <p className="text-slate-600 leading-relaxed">
            We implement industry-standard security measures to protect your personal information, including encryption
            of sensitive data in transit and at rest. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">5. Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            We use cookies and similar technologies to remember your preferences, analyze site traffic, and understand
            how users interact with our platform. You can control cookie settings through your browser preferences.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">6. Your Rights</h2>
          <p className="text-slate-600 leading-relaxed">
            You have the right to access, correct, or delete your personal information. You may also request a copy of
            the data we hold about you. Contact us at info@trailexplorer.com to exercise these rights.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">7. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed">
            If you have any questions about this privacy policy or how we handle your data, please contact us at
            info@trailexplorer.com or +503 1234 5678.
          </p>
        </section>
      </div>
    </div>
  </div>
);
