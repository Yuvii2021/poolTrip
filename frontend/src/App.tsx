import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PackageDetailPage } from './pages/PackageDetailPage';
import { DashboardPage } from './pages/DashboardPage';

// Protected Route Component
const ProtectedRoute = ({ children, requireAgency = false }: { children: React.ReactNode; requireAgency?: boolean }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#030712'
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(148, 163, 184, 0.1)',
          borderTopColor: '#06b6d4',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAgency && user?.role !== 'AGENCY') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Auth Route (redirect if already authenticated)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Layout with Navbar
const Layout = ({ children, showNav = true }: { children: React.ReactNode; showNav?: boolean }) => {
  return (
    <>
      {showNav && <Navbar />}
      {children}
    </>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/package/:id" element={<Layout><PackageDetailPage /></Layout>} />
      
      {/* Auth Routes */}
      <Route path="/login" element={
        <AuthRoute>
          <Layout showNav={false}><LoginPage /></Layout>
        </AuthRoute>
      } />
      <Route path="/register" element={
        <AuthRoute>
          <Layout showNav={false}><RegisterPage /></Layout>
        </AuthRoute>
      } />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute requireAgency>
          <Layout><DashboardPage /></Layout>
        </ProtectedRoute>
      } />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
