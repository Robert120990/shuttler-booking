import { useState } from 'react';
import { MapPin, Mail, Phone, Send, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SEO } from '../components/seo/SEO';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <SEO
        title="Contact Us"
        description="Contact Trail Explorer for questions about shuttle bookings, transfers and transportation across Central America. Our support team is available 24/7."
        path="/contact"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Have a question about booking a shuttle or need travel advice? Our team is here to help 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-900">Office Location</h4>
                    <p className="text-slate-600">San Salvador, El Salvador</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-900">Email</h4>
                    <p className="text-slate-600">info@trailexplorer.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-900">Phone</h4>
                    <p className="text-slate-600">+503 1234 5678</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 pt-2">
                  Average response time: under 2 hours. We respond in English and Spanish.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600">
                    Thank you for contacting us. Our team will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <Input label="Name" placeholder="Your name" required />
                  <Input label="Email" type="email" placeholder="your@email.com" required />
                  <Input label="Subject" placeholder="What is this about?" />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                    <textarea
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={5}
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <Button className="w-full" type="submit">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
