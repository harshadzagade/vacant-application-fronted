import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import ApplicationForm from './components/ApplicationForm';
import SubmissionConfirmation from './components/SubmissionConfirmation';
import ViewApplication from './components/ViewApplication';
import Swal from 'sweetalert2';

// ProtectedRoute component to guard /application
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Component to render the print header conditionally
const PrintHeader = ({ userData, programName }) => {
  const location = useLocation();
  const isViewApplicationRoute = location.pathname.startsWith('/view-application');

  return isViewApplicationRoute ? (
    <div className="hidden print:block border-b border-gray-300 pb-2">
      <h1 className="text-2xl font-bold text-center mb-6">{userData?.institutes?.[0]?.name || 'MET Institute of Management'}</h1>
      <h2 className="text-xl font-semibold text-center mb-4">
        Application Form for {programName || 'Program'} Admission Against Vacant/Cancellation Seat
      </h2>
      <p className="text-center mb-6">Academic Year: 2025-2026</p>
    </div>
  ) : null;
};

function App() {
  const [userData, setUserData] = useState(null);
  const [programName, setProgramName] = useState(null);

  const formTypeNames = {
    METIPP: 'Pharmacy Diploma',
    METIPD: 'Pharmacy Degree',
    METIOM: 'IOM',
    METICS: 'MCA',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch user data for institute name
        const userResponse = await fetch('https://vacantseats.met.edu/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userResult = await userResponse.json();
        if (!userResult.success) throw new Error(userResult.message || 'User data fetch failed');
        setUserData(userResult.user);

        // Fetch application data if on ViewApplication route
        const path = window.location.pathname;
        const applicationId = path.split('/view-application/')[1];
        if (applicationId) {
          const appResponse = await fetch(`https://vacantseats.met.edu/api/application/details/${applicationId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!appResponse.ok) throw new Error('Failed to fetch application details');
          const appResult = await appResponse.json();
          if (!appResult.success) throw new Error(appResult.message || 'Application fetch failed');
          const formType = appResult.application.formType;
          setProgramName(formTypeNames[formType] || 'Unknown Program');
        }
      } catch (error) {
        console.error('Error fetching data for header:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 print:bg-white print:p-0">
        <div className="mx-auto print:mx-0 print:max-w-none">
          <PrintHeader userData={userData} programName={programName} />
          {/* <h1 className="text-3xl font-bold text-center mb-8 print:hidden">Admission Application Portal</h1> */}
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