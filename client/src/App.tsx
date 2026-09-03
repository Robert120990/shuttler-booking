import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/admin/AdminLayout';
import { HomePage } from './components/public/HomePage';
import { CountryPage } from './components/public/CountryPage';
import { CityPage } from './components/public/CityPage';
import { ShuttlePage } from './components/public/ShuttlePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FAQsPage } from './pages/FAQsPage';
import { AboutPage } from './pages/AboutPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { CookiesPage } from './pages/CookiesPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminCountries } from './components/admin/AdminCountries';
import { AdminCities } from './components/admin/AdminCities';
import { AdminShuttles } from './components/admin/AdminShuttles';
import { AdminBookings } from './components/admin/AdminBookings';
import { AdminFAQs } from './components/admin/AdminFAQs';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminHostels } from './components/admin/AdminHostels';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="countries/:slug" element={<CountryPage />} />
            <Route path="cities/:slug" element={<CityPage />} />
            <Route path="shuttles/:id" element={<ShuttlePage />} />
            <Route path="faqs" element={<FAQsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="cookies" element={<CookiesPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="search" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="countries" element={<AdminCountries />} />
            <Route path="cities" element={<AdminCities />} />
            <Route path="hostels" element={<AdminHostels />} />
            <Route path="shuttles" element={<AdminShuttles />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="faqs" element={<AdminFAQs />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
