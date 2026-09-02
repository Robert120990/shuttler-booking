import { SEO } from '../components/seo/SEO';

export const TermsPage = () => (
  <div className="bg-slate-50 min-h-screen py-12">
    <SEO
      title="Terms & Conditions"
      description="Read the terms and conditions for using the Trail Explorer shuttle booking platform. Understand booking policies, payment terms and your rights."
      path="/terms"
    />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms & Conditions</h1>
        <p className="text-sm text-slate-500">Last updated: January 2026</p>
      </div>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Agreement to Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            By accessing and using the Trail Explorer website, you agree to be bound by these Terms and Conditions.
            If you do not agree to these terms, please do not use our services.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">2. Booking Services</h2>
          <p className="text-slate-600 leading-relaxed">
            Trail Explorer acts as a booking platform connecting travelers with transportation service providers
            across Central America. We facilitate the booking process but are not the direct provider of transportation
            services. All services are subject to availability and confirmation.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Pricing and Payment</h2>
          <p className="text-slate-600 leading-relaxed">
            All prices are listed in US Dollars (USD) and are per person unless otherwise stated. Full payment is
            required at the time of booking. We accept major credit cards, debit cards, Apple Pay, Google Pay and PayPal.
            Payment processing fees may apply.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Cancellations and Refunds</h2>
          <p className="text-slate-600 leading-relaxed">
            Cancellations made at least 24 hours before departure may be eligible for a refund within 3-5 business days.
            Late cancellations (less than 24 hours before departure) will not be refunded. Store credit may be issued
            instead of refunds for eligible cancellations and is valid for one year.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">5. Traveler Responsibilities</h2>
          <p className="text-slate-600 leading-relaxed">
            Travelers are responsible for having valid travel documents, including passports with at least six months
            validity for international services. Travelers must arrive at pickup locations on time. Late arrivals may
            result in forfeiture of the booking.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">6. Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed">
            Trail Explorer is not liable for delays, cancellations, or disruptions caused by weather, road conditions,
            border closures, or actions of third-party service providers. Our maximum liability is limited to the amount
            paid for the specific booking.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">7. Changes to Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
            Continued use of the platform constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  </div>
);
