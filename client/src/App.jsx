import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DonorDashboardPage from './pages/DonorDashboardPage';
import RecipientDashboardPage from './pages/RecipientDashboardPage';
import HospitalDashboardPage from './pages/HospitalDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';


function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/donor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['donor']}>
                    <DonorDashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/recipient/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['recipient']}>
                    <RecipientDashboardPage />
                  </ProtectedRoute>
                }
              />


              <Route
                path="/hospital/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['hospital']}>
                    <HospitalDashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
