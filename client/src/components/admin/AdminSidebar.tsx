import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Globe, MapPin, Bus, Calendar, Users, HelpCircle, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Globe, label: 'Países', href: '/admin/countries' },
  { icon: MapPin, label: 'Ciudades', href: '/admin/cities' },
  { icon: Bus, label: 'Shuttles', href: '/admin/shuttles' },
  { icon: Calendar, label: 'Reservas', href: '/admin/bookings' },
  { icon: Users, label: 'Usuarios', href: '/admin/users' },
  { icon: HelpCircle, label: 'FAQs', href: '/admin/faqs' },
  { icon: Settings, label: 'Configuración', href: '/admin/settings' },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleNavClick = () => {
    // Close sidebar on mobile when a nav item is clicked
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-40 flex flex-col transition-transform duration-300 ease-in-out',
          'lg:relative lg:translate-x-0 lg:z-auto lg:flex-shrink-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 mb-4">
          <Link to="/" className="flex items-center gap-2" onClick={handleNavClick}>
            <img src="/logo.jpeg" alt="Trail Explorer" className="h-9 w-auto object-contain rounded-md" />
            <span className="font-semibold">Admin Panel</span>
          </Link>
          {/* Close button - only visible on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 px-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === item.href
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 px-4 pb-4">
          <Link
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2"
          >
            <Globe className="w-5 h-5 flex-shrink-0" />
            Ver Sitio
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
};

// Hamburger button component for use in the header
export const AdminMenuButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
    aria-label="Abrir menú"
  >
    <Menu className="w-6 h-6" />
  </button>
);
