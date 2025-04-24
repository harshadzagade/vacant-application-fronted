import { useState } from 'react';
import ApplicationForm from './components/ApplicationForm';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';

function App() {
  const [currentStep, setCurrentStep] = useState('registration');

  const handleRegistrationSuccess = () => {
    setCurrentStep('login');
  };

  const handleLoginSuccess = () => {
    setCurrentStep('application');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 text-brand-900">Institute Level Seat</h1>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8 text-sm text-brand-700">
          <span className={currentStep === 'registration' ? 'font-bold' : ''}>1. Registration</span>
          <span className="mx-2">→</span>
          <span className={currentStep === 'login' ? 'font-bold' : ''}>2. Login</span>
          <span className="mx-2">→</span>
          <span className={currentStep === 'application' ? 'font-bold' : ''}>3. Application</span>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {currentStep === 'registration' && (
            <>
              <h2 className="text-2xl font-semibold mb-6 text-brand-900 border-b border-brand-200 pb-2">Registration</h2>
              <RegistrationForm onRegistrationSuccess={handleRegistrationSuccess} />
            </>
          )}
          {currentStep === 'login' && (
            <>
              <h2 className="text-2xl font-semibold mb-6 text-brand-900 border-b border-brand-200 pb-2">Login</h2>
              <LoginForm onLogin={handleLoginSuccess} />
            </>
          )}
          {currentStep === 'application' && (
            <>
              <h2 className="text-2xl font-semibold mb-6 text-brand-900 border-b border-brand-200 pb-2">Application Form</h2>
              <ApplicationForm />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;