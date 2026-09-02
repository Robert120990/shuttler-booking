import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/seo/SEO';

export const NotFoundPage = () => (
  <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12">
    <SEO
      title="Page Not Found"
      description="The page you are looking for does not exist. Return to the Trail Explorer homepage to book shuttles across Central America."
      path="/404"
      noindex
    />
    <div className="text-center px-4">
      <h1 className="text-6xl font-bold text-emerald-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Page Not Found</h2>
      <p className="text-slate-600 mb-8 max-w-md mx-auto">
        The page you are looking for doesn't exist or has been moved. Let's get you back on the road.
      </p>
      <Link to="/">
        <Button size="lg">
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </Button>
      </Link>
    </div>
  </div>
);
