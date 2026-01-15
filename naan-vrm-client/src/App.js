import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Import all page components
import DashboardPage from './pages/DashboardPage';
import SuppliersPage from './pages/SuppliersPage';
import ClientsPage from './pages/ClientsPage';
import BranchPortalPage from './pages/BranchPortalPage';
import LoginPage from './pages/LoginPage';
import ReportsPage from './pages/ReportsPage';
import TagManagementPage from './pages/TagManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import BranchManagementPage from './pages/BranchManagementPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PaymentsDashboardPage from './pages/PaymentsDashboardPage';
import NotificationsHistoryPage from './pages/NotificationsHistoryPage';

// Import layout components
import NotificationsBell from './components/layout/NotificationsBell';


function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    // If user is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  return children;
}


function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const isTreasurer = ['admin', 'treasurer', 'community_manager', 'bookkeeper'].includes(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const LinkItem = ({ to, children }) => (
    <Link
      to={to}
      className="text-blue-800 hover:text-blue-600 font-medium py-2 px-1 block md:inline-block"
      onClick={closeMenu}
    >
      {children}
    </Link>
  );

  return (
    <header className="bg-blue-100 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center bg-blue-100 relative z-50">
          <div className="flex items-center">
            {/* Hamburger Menu Button - Always visible for Treasurer */}
            {user && isTreasurer && (
              <button
                className="p-2 text-blue-800 focus:outline-none ml-2"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
            <h1 className="text-xl md:text-2xl font-bold text-blue-800 truncate">
              {window.innerWidth < 400 ? 'מערכת כספים - נען' : 'מערכת מידע פיננסית - קיבוץ נען'}
            </h1>
          </div>

          <div className="flex items-center">
            {user && (
              <>
                {/* Desktop Navigation REMOVED for Treasurer - Hamburger only */}
                {!isTreasurer && (
                  <span className="text-lg text-blue-800 font-semibold ml-6 hidden md:inline">פורטל מנהל ענף</span>
                )}

                {/* Notification Bell - Visible always for treasurer */}
                {isTreasurer && (
                  <div className="ml-2">
                    <NotificationsBell />
                  </div>
                )}

                <button onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600 font-bold py-1.5 px-3 md:py-2 md:px-4 text-sm md:text-base rounded-md">
                  התנתק
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Dropdown - Always visible when toggled */}
        {user && isTreasurer && (
          <div
            className={`absolute top-full left-0 right-0 bg-blue-50 shadow-lg border-t border-blue-200 transition-all duration-300 ease-in-out overflow-hidden z-20 ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <nav className="flex flex-col p-4 space-y-3">
              <LinkItem to="/">לוח מחוונים</LinkItem>
              <LinkItem to="/payments">מעקב תשלומים</LinkItem>
              <LinkItem to="/reports">דוחות</LinkItem>
              <LinkItem to="/suppliers">ניהול ספקים</LinkItem>
              <LinkItem to="/tag-management">ניהול תגים</LinkItem>
              <LinkItem to="/clients">ניהול לקוחות</LinkItem>
              <LinkItem to="/branches">ניהול ענפים</LinkItem>
              <LinkItem to="/user-management">ניהול משתמשים</LinkItem>
              <LinkItem to="/notifications-history">היסטוריית התראות</LinkItem>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  const isTreasurer = ['admin', 'treasurer', 'community_manager', 'bookkeeper'].includes(user?.role);

  return (
    <Routes>
      {isTreasurer ? (
        <>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/payments" element={<PaymentsDashboardPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/tag-management" element={<TagManagementPage />} />
          <Route path="/user-management" element={<UserManagementPage />} />
          <Route path="/branches" element={<BranchManagementPage />} />
          <Route path="/notifications-history" element={<NotificationsHistoryPage />} />
        </>
      ) : (
        <Route path="/" element={<BranchPortalPage />} />
      )}
      {/* Redirect all unknown routes to home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main application component that organizes the entire structure
function App() {
  return (
    <NotificationProvider>
      <Routes>
        {/* Public routes available to everyone */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* All other routes ("/*") are protected */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="bg-gray-100 min-h-screen">
                <Header />
                <main className="container mx-auto p-6 mt-4">
                  <AppRoutes />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </NotificationProvider>
  );
}

export default App;

