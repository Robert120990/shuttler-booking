import { MapPin, Mail, Phone, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SEO } from '../components/seo/SEO';

export const AboutPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO
        title="About Us"
        description="Trail Explorer is your trusted partner for booking shuttles, transfers, and transportation across Central America since 2011. We connect travelers with trusted local operators."
        path="/about"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Trail Explorer',
            description: 'Shuttle booking platform across Central America',
            telephone: '+503 1234 5678',
            email: 'info@trailexplorer.com',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'San Salvador',
              addressCountry: 'SV',
            },
          },
        ]}
      />
      <section className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">About Trail Explorer</h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            Your trusted partner for booking shuttles, transfers, and transportation across Central America since 2011.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
              <p className="text-slate-600 mb-4">
                Trail Explorer was founded with a simple mission: to make traveling through Central America easy and accessible. What started as a small local shuttle service has grown into a comprehensive platform connecting travelers across 8 countries.
              </p>
              <p className="text-slate-600 mb-4">
                We partner with trusted local operators to provide safe, reliable, and comfortable transportation services. Whether you're traveling between cities within a country or crossing borders, we've got you covered.
              </p>
              <p className="text-slate-600">
                Our team is dedicated to providing excellent customer service and making your travel experience as smooth as possible.
              </p>
            </div>
            <div className="relative h-80 rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
                alt="Central America landscapes"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Local Expertise</h3>
              <p className="text-slate-600">We partner with trusted local operators who know the routes best.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">24/7 Support</h3>
              <p className="text-slate-600">We're here to help you anytime via chat or email.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Easy Booking</h3>
              <p className="text-slate-600">Book your transportation in minutes with our simple online system.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
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
                </div>
                <form className="space-y-4">
                  <Input label="Name" placeholder="Your name" />
                  <Input label="Email" type="email" placeholder="your@email.com" />
                  <Input label="Message" placeholder="How can we help?" />
                  <Button className="w-full">Send Message</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};
