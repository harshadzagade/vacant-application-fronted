import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import ApplicationForm from './components/ApplicationForm';
import SubmissionConfirmation from './components/SubmissionConfirmation';
import ViewApplication from './components/ViewApplication';

// ProtectedRoute component to guard /application
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-6 text-brand-900">Institute Level Seat</h1>
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
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;