import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from './Header';
import { Footer } from './Footer';
import { LanguageSetter } from '../seo/LanguageSetter';
import { OrganizationSchema } from '../seo/schema';

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <LanguageSetter />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(OrganizationSchema)}</script>
      </Helmet>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
