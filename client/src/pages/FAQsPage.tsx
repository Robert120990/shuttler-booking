import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { SEO } from '../components/seo/SEO';

const FAQ_DATA = [
  {
    category: 'Booking',
    questions: [
      { q: 'How can I book a service?', a: 'To book a service, click the "Book Now" button on our website. Select an available date, pickup time, enter your locations and number of seats, then proceed to payment.' },
      { q: 'Can I book multiple seats at once?', a: 'Yes, you can select the number of seats you need when completing the booking form on our website.' },
      { q: 'Can I choose my pickup and dropoff locations?', a: 'Yes, during the booking process you can enter or select your preferred pickup and dropoff locations.' },
    ],
  },
  {
    category: 'Payment',
    questions: [
      { q: 'What payment methods are accepted?', a: 'We accept Visa and Mastercard credit/debit cards, ApplePay, GooglePay, and PayPal.' },
      { q: 'Can I pay cash?', a: 'We do not accept cash for reservations. Please use our online payment methods.' },
      { q: 'Are there any processing fees?', a: 'Payment processing fees are currently 20% for each payment made on our platforms.' },
    ],
  },
  {
    category: 'Cancellation',
    questions: [
      { q: 'What is your cancellation policy?', a: 'You can cancel any service at any time. Cancellations made at least 24 hours before departure are eligible for a refund within 3-5 business days.' },
      { q: 'What about late cancellations?', a: 'Late cancellations (less than 24 hours before departure) will not be refunded as the payment is considered an administration fee.' },
      { q: 'Can I get a credit instead of a refund?', a: 'Yes! Instead of a refund to your payment method, you can receive the full amount as Store Credit, valid for one year.' },
    ],
  },
  {
    category: 'Travel',
    questions: [
      { q: 'What is the luggage policy?', a: 'Standard luggage includes one backpack and one small carry-on bag per person. Surfboards, bicycles, or kayaks are not allowed.' },
      { q: 'Can I bring my pet?', a: 'Pets are not allowed on international buses due to immigration regulations. On domestic buses, pets are allowed in carriers but may need an additional seat.' },
      { q: 'What documents do I need for international services?', a: 'All travelers must present appropriate documentation at each border crossing, including a passport with at least six months validity.' },
    ],
  },
];

export const FAQsPage = () => {
  const flatFaqs = FAQ_DATA.flatMap((section) => section.questions);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: flatFaqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <SEO
        title="Frequently Asked Questions"
        description="Find answers to common questions about booking shuttles and transfers in Central America. Learn about payments, cancellations, luggage policy and more."
        path="/faqs"
        jsonLd={[faqSchema]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-slate-600">Find answers to common questions about our services</p>
        </div>

        <div className="space-y-8">
          {FAQ_DATA.map((section) => (
            <Card key={section.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  {section.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.questions.map((item, index) => (
                  <details key={index} className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <span className="font-medium text-slate-900">{item.q}</span>
                      <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="p-4 text-slate-600">
                      {item.a}
                    </div>
                  </details>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">Still have questions?</p>
          <Link to="/contact" className="text-emerald-600 font-medium hover:underline">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};
