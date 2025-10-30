import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import all page components
import DashboardPage from './pages/DashboardPage';
import SuppliersPage from './pages/SuppliersPage';
import BranchPortalPage from './pages/BranchPortalPage';
import LoginPage from './pages/LoginPage';
import ReportsPage from './pages/ReportsPage';
import TagManagementPage from './pages/TagManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PaymentsDashboardPage from './pages/PaymentsDashboardPage';

// Import layout components
import NotificationsBell from './components/layout/NotificationsBell';


function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    // אם המשתמש לא מחובר, הפנה אותו לעמוד הכניסה
    return <Navigate to="/login" replace />;
  }
  return children;
}


function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isTreasurer = user?.role_id === 1 || user?.role_id === 2; 

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-blue-100 p-4 shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-blue-800">מערכת מידע פיננסית - קיבוץ נען</h1>
                <div className="flex items-center">
                    {user && (
                        <>
                            {isTreasurer ? (
                                <nav className="ml-6 flex items-center gap-6">
                                    <Link to="/" className="text-blue-800 hover:text-blue-600">לוח מחוונים</Link>
                                    <Link to="/payments" className="text-blue-800 hover:text-blue-600">מעקב תשלומים</Link>
                                    <Link to="/suppliers" className="text-blue-800 hover:text-blue-600">ניהול ספקים</Link>
                                    <Link to="/reports" className="text-blue-800 hover:text-blue-600">דוחות</Link>
                                    <Link to="/tag-management" className="text-blue-800 hover:text-blue-600">ניהול תגים</Link>
                                    <Link to="/user-management" className="text-blue-800 hover:text-blue-600">ניהול משתמשים</Link>
                                    <NotificationsBell />
                                </nav>
                            ) : (
                                <span className="text-lg text-blue-800 font-semibold ml-6">פורטל מנהל ענף</span>
                            )}
                            <button onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600 font-bold py-2 px-4 rounded-md mr-6">
                                התנתק
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

function AppRoutes() {
    const { user } = useAuth();
    const isTreasurer = user?.role_id === 1 || user?.role_id === 2;

    return (
        <Routes>
            {isTreasurer ? (
                <>
                    <Route path="/" element={<DashboardPage />} />
                        <Route path="/payments" element={<PaymentsDashboardPage />} />
                    <Route path="/suppliers" element={<SuppliersPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/tag-management" element={<TagManagementPage />} />
                    <Route path="/user-management" element={<UserManagementPage />} />
                </>
            ) : (
                <Route path="/" element={<BranchPortalPage />} />
            )}
            {/* הפניה של כל נתיב לא מוכר לעמוד הבית */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

// רכיב האפליקציה הראשי שמארגן את כלל המבנה
function App() {
  return (
    <Routes>
      {/* נתיבים ציבוריים הזמינים לכולם */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      
      {/* כל שאר הנתיבים ("/*") מוגנים */}
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
  );
}

export default App;

