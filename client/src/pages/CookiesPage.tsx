import { SEO } from '../components/seo/SEO';

export const CookiesPage = () => (
  <div className="bg-slate-50 min-h-screen py-12">
    <SEO
      title="Cookie Policy"
      description="Learn about how Trail Explorer uses cookies and similar technologies to improve your browsing experience."
      path="/cookies"
    />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Cookie Policy</h1>
        <p className="text-sm text-slate-500">Last updated: January 2026</p>
      </div>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">1. What Are Cookies?</h2>
          <p className="text-slate-600 leading-relaxed">
            Cookies are small text files stored on your device when you visit a website. They help websites remember
            your preferences and understand how you interact with the site.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">2. How We Use Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            We use essential cookies to keep our platform functioning, preference cookies to remember your language
            and theme choices, and analytics cookies to understand how visitors use our site. We do not use cookies
            to serve personalized advertising.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Managing Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            You can control and delete cookies through your browser settings. Most browsers allow you to block cookies,
            but this may affect the functionality of our platform. Disabling essential cookies may prevent you from
            completing bookings.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed">
            If you have questions about our cookie usage, please contact us at info@trailexplorer.com.
          </p>
        </section>
      </div>
    </div>
  </div>
);
