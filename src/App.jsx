import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import ApplicationForm from './components/ApplicationForm';
import SubmissionConfirmation from './components/SubmissionConfirmation';
import ViewApplication from './components/ViewApplication';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';

// ProtectedRoute component to guard /application
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 print:bg-white print:p-0">
        <div className="mx-auto print:mx-0 print:max-w-none">
          <Routes>
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/application"
              element={
                <ProtectedRoute>
                  <ApplicationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submission-confirmation/:applicationId"
              element={
                <ProtectedRoute>
                  <SubmissionConfirmation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-application/:applicationId"
              element={
                <ProtectedRoute>
                  <ViewApplication />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/register" />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;