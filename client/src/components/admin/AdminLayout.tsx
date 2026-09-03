import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AdminSidebar, AdminMenuButton } from './AdminSidebar';
import { useAuthStore } from '../../stores/authStore';
import { SEO } from '../seo/SEO';

export const AdminLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <AdminMenuButton onClick={() => setSidebarOpen(true)} />
          <div className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="Trail Explorer" className="h-7 w-auto object-contain rounded" />
            <span className="font-semibold text-slate-800 text-sm">Admin Panel</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
