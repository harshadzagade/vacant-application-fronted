import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Send OTP, 2: Verify OTP
  const [resetFormData, setResetFormData] = useState({
    username: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetErrors, setResetErrors] = useState({});
  const [resetServerError, setResetServerError] = useState('');
  const [resetIsLoading, setResetIsLoading] = useState(false);
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (showResetModal && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [showResetModal, resetStep]);

  // Close modal on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeResetModal();
      }
    };
    if (showResetModal) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showResetModal]);

  const validateForm = () => {
    const newErrors = {};
    const trimmedUsername = formData.username.trim();
    if (!trimmedUsername) newErrors.username = 'Username is required';
    else if (!/^[A-Z0-9]{8}\d{3}$/.test(trimmedUsername)) newErrors.username = 'Invalid username format (e.g., METIOM25001)';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      // eslint-disable-next-line no-useless-escape
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters long, with at least one lowercase letter, one uppercase letter, one number, and one special character (!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = () => {
    const newErrors = {};
    if (resetStep === 1) {
      const trimmedUsername = resetFormData.username.trim();
      if (!trimmedUsername) newErrors.username = 'Username is required';
      else if (!/^[A-Z0-9]{8}\d{3}$/.test(trimmedUsername)) newErrors.username = 'Invalid username format (e.g., METIOM25001)';
    } else {
      if (!resetFormData.otp) newErrors.otp = 'OTP is required';
      else if (!/^\d{6}$/.test(resetFormData.otp)) newErrors.otp = 'OTP must be a 6-digit number';
      if (!resetFormData.newPassword) newErrors.newPassword = 'New password is required';
      else if (resetFormData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters long';
      if (resetFormData.newPassword !== resetFormData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setResetErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'username' ? value.trim() : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetFormData((prev) => ({ ...prev, [name]: name === 'username' ? value.trim() : value }));
    setResetErrors((prev) => ({ ...prev, [name]: '' }));
    setResetServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError('');

    try {
      const response = await fetch('https://admission.met.edu/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setServerError('');
        setFormData({ username: '', password: '' });
        navigate('/application');
      } else {
        setServerError(data.message || 'Invalid credentials');
      }
    } catch {
      setServerError('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!validateResetForm()) return;

    setResetIsLoading(true);
    setResetServerError('');

    try {
      if (resetStep === 1) {
        const response = await fetch('https://admission.met.edu/api/auth/reset-password/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: resetFormData.username.trim(),
          }),
        });
        const data = await response.json();

        if (data.success) {
          setResetServerError('');
          setResetStep(2);
        } else {
          setResetServerError(data.message || 'Failed to send OTP');
        }
      } else {
        const response = await fetch('https://admission.met.edu/api/auth/reset-password/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: resetFormData.username.trim(),
            otp: resetFormData.otp,
            newPassword: resetFormData.newPassword,
          }),
        });
        const data = await response.json();

        if (data.success) {
          setResetServerError('');
          closeResetModal();
          setServerError('Password reset successful. Please log in with your new password.');
        } else {
          setResetServerError(data.message || 'Invalid OTP or username');
        }
      }
    } catch {
      setResetServerError('Network error. Please try again later.');
    } finally {
      setResetIsLoading(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetStep(1);
    setResetFormData({ username: '', otp: '', newPassword: '', confirmPassword: '' });
    setResetErrors({});
    setResetServerError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 print:min-h-0 print:p-0">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md print:w-full print:shadow-none print:rounded-none">
        <div className="flex justify-center mb-2">
          <img src="https://www.met.edu/frontendassets/images/MET_College_in_Mumbai_logo.png" alt="Logo" className="h-[4rem] w-auto" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold text-brand-900 border-b-2 border-brand-200 pb-2 text-center">
            Application Login
          </h2>
          {serverError && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
              {serverError}
            </div>
          )}
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors.username ? 'border-red-500' : 'border-brand-200'
                }`}
              placeholder="Enter your username (e.g., METIOM25001)"
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors.password ? 'border-red-500' : 'border-brand-200'
                  }`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-700 hover:text-brand-900"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-brand-700 hover:text-brand-900 text-sm font-medium underline"
              >
                Forgot Password?
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Link
              to="/register"
              className="text-brand-700 hover:text-brand-900 text-sm font-medium underline"
            >
              Create an account
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg font-semibold text-white transition shadow-md hover:shadow-lg ${isLoading
                ? 'bg-brand-300 cursor-not-allowed'
                : 'bg-brand-500 hover:bg-brand-600'
                }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-2xl p-8 w-full max-w-md">
            <form onSubmit={handleResetSubmit} className="space-y-6">
              <h2 className="text-2xl font-semibold text-brand-900 border-b-2 border-brand-200 pb-2 text-center">
                {resetStep === 1 ? 'Reset Password' : 'Verify OTP'}
              </h2>
              {resetServerError && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                  {resetServerError}
                </div>
              )}
              {resetStep === 1 ? (
                <div>
                  <label className="block text-brand-700 text-sm font-medium mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={resetFormData.username}
                    onChange={handleResetChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${resetErrors.username ? 'border-red-500' : 'border-brand-200'
                      }`}
                    placeholder="Enter your username (e.g., METIOM25001)"
                    disabled={resetIsLoading}
                    ref={firstInputRef}
                  />
                  {resetErrors.username && (
                    <p className="text-red-500 text-xs mt-1">{resetErrors.username}</p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">
                      OTP *
                    </label>
                    <input
                      type="text"
                      name="otp"
                      value={resetFormData.otp}
                      onChange={handleResetChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${resetErrors.otp ? 'border-red-500' : 'border-brand-200'
                        }`}
                      placeholder="Enter 6-digit OTP"
                      disabled={resetIsLoading}
                      ref={firstInputRef}
                    />
                    {resetErrors.otp && (
                      <p className="text-red-500 text-xs mt-1">{resetErrors.otp}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">
                      New Password *
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={resetFormData.newPassword}
                      onChange={handleResetChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${resetErrors.newPassword ? 'border-red-500' : 'border-brand-200'
                        }`}
                      placeholder="Enter new password"
                      disabled={resetIsLoading}
                    />
                    {resetErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">{resetErrors.newPassword}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-brand-700 text-sm font-medium mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={resetFormData.confirmPassword}
                      onChange={handleResetChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${resetErrors.confirmPassword ? 'border-red-500' : 'border-brand-200'
                        }`}
                      placeholder="Confirm new password"
                      disabled={resetIsLoading}
                    />
                    {resetErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{resetErrors.confirmPassword}</p>
                    )}
                  </div>
                </>
              )}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={closeResetModal}
                  className="text-brand-700 hover:text-brand-900 text-sm font-medium underline"
                  disabled={resetIsLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetIsLoading}
                  className={`px-6 py-2 rounded-lg font-semibold text-white transition shadow-md hover:shadow-lg ${resetIsLoading
                    ? 'bg-brand-300 cursor-not-allowed'
                    : 'bg-brand-500 hover:bg-brand-600'
                    }`}
                >
                  {resetIsLoading
                    ? resetStep === 1
                      ? 'Sending OTP...'
                      : 'Verifying...'
                    : resetStep === 1
                      ? 'Send OTP'
                      : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;