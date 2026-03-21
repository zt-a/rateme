import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Users, User as UserIcon, MessageSquare, Menu, X, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/admin/users', label: t('users'), icon: Users },
    { path: '/admin/persons', label: t('persons'), icon: UserIcon },
    { path: '/admin/comments', label: t('comments'), icon: MessageSquare },
    { path: '/admin/reports', label: 'Жалобы', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t('adminPanel')}
          </h1>
          {/* Mobile sidebar toggle */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-64 space-y-2`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start ${
                      isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}