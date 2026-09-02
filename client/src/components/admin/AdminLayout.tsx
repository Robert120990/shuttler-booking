import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { useAuthStore } from '../../stores/authStore';
import { SEO } from '../seo/SEO';

export const AdminLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <SEO title="Admin Dashboard" description="Admin panel." path="/admin" noindex />
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
