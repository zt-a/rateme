import { createBrowserRouter, Navigate } from 'react-router';
import { Navbar } from './components/Navbar';
import { AuthGuard } from './components/AuthGuard';
import { Home } from './pages/Home';
import { PersonDetail } from './pages/PersonDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Profile } from './pages/Profile';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminPersons } from './pages/admin/AdminPersons';
import { AdminComments } from './pages/admin/AdminComments';
import { Ratings } from './pages/Ratings';
import { Footer } from './components/Footer';
import { AdminReports } from './pages/admin/AdminReports';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Takedown } from './pages/Takedown';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Report } from './pages/Report';
import { AddPerson } from './pages/AddPerson';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },

  { 
    path: '/about', 
    element: <Layout><About /></Layout> 

  },
  { 
    path: '/contact', 
    element: <Layout><Contact /></Layout> 

  },
  { 
    path: '/takedown', 
    element: <Layout><Takedown /></Layout> 

  },
  { 
    path: '/privacy', 
    element: <Layout><Privacy /></Layout> 
    
  },
  { 
    path: '/terms', 
    element: <Layout><Terms /></Layout> 
    
  },
  { 
    path: '/report', 
    element: <Layout><Report /></Layout> 
    
  },
  {
    path: '/ratings',
    element: (
        <Layout>
        <Ratings />
        </Layout>
    ),
  },
  {
    path: '/add-person',
    element: (
      <AuthGuard>
        <Layout>
          <AddPerson />
        </Layout>
      </AuthGuard>
    ),
  },
  {
    path: '/persons/:id',
    element: (
      <Layout>
        <PersonDetail />
      </Layout>
    ),
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/profile',
    element: (
      <AuthGuard>
        <Layout>
          <Profile />
        </Layout>
      </AuthGuard>
    ),
  },
  {
    path: '/admin',
    element: (
      <AuthGuard requireModerator>
        <Layout>
          <AdminLayout />
        </Layout>
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/users" replace />,
      },
      {
        path: 'users',
        element: <AdminUsers />,
      },
      {
        path: 'persons',
        element: <AdminPersons />,
      },
      {
        path: 'comments',
        element: <AdminComments />,
      },

      { 
        path: 'reports', 
        element: <AdminReports /> 
      },
    ],
  },
  {
    path: '*',
    element: (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              404
            </h1>
            <p className="text-white text-xl">Page not found</p>
          </div>
        </div>
      </Layout>
    ),
  },
]);
