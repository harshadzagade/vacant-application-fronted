import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNo: '',
    password: '',
    instituteCode: '',
  });
  const [otp, setOtp] = useState('');
  const [instituteId, setInstituteId] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  // Resend OTP timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Extract instituteCode from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const instituteCode = urlParams.get('code');
    if (instituteCode) {
      setFormData((prev) => ({ ...prev, instituteCode }));
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phoneNo) newErrors.phoneNo = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phoneNo)) newErrors.phoneNo = 'Phone number must be 10 digits';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.instituteCode) newErrors.instituteCode = 'Institute code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors = {};
    if (!otp) newErrors.otp = 'OTP is required';
    else if (!/^\d{6}$/.test(otp)) newErrors.otp = 'OTP must be 6 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'email' ? value.trim() : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
    if (name === 'phoneNo' && isOtpSent) {
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setInstituteId(null);
      setOtp('');
      setResendTimer(0);
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    setErrors((prev) => ({ ...prev, otp: '' }));
    setServerError('');
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNo: formData.phoneNo,
        code: formData.instituteCode,
      });
      setInstituteId(response.data.instituteId);
      setIsOtpSent(true);
      setResendTimer(30);
      setServerError('');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setServerError('');
    setOtp('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/resend-otp', {
        phoneNo: formData.phoneNo,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        code: formData.instituteCode,
      });
      setInstituteId(response.data.instituteId);
      setResendTimer(30);
      setServerError('');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;

    setIsLoading(true);
    setServerError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        phoneNo: formData.phoneNo,
        otp,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        instituteId,
        code: formData.instituteCode,
      });

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Invalid OTP');
      }

      setIsOtpVerified(true);
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phoneNo: '',
        password: '',
        instituteCode: '',
      });
      setOtp('');
      setIsOtpSent(false);
      setResendTimer(0);
      navigate('/login');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full border border-gray-100">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <h2 className="text-3xl font-semibold text-gray-800 text-center border-b-2 border-gray-200 pb-3">
            Registration
          </h2>
          {serverError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {serverError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
                disabled={isLoading || isOtpVerified}
                aria-invalid={errors.firstName ? 'true' : 'false'}
                aria-label="First Name"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Middle Name
              </label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400 ${
                  errors.middleName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your middle name"
                disabled={isLoading || isOtpVerified}
                aria-label="Middle Name"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
                disabled={isLoading || isOtpVerified}
                aria-invalid={errors.lastName ? 'true' : 'false'}
                aria-label="Last Name"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                disabled={isLoading || isOtpVerified}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-label="Email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Phone Number *
              </label>
              <div className="flex space-x-3">
                <input
                  type="tel"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400 ${
                    errors.phoneNo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                  disabled={isLoading || isOtpVerified}
                  aria-invalid={errors.phoneNo ? 'true' : 'false'}
                  aria-label="Phone Number"
                />
                {!isOtpSent && !isOtpVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className={`px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap ${
                      isLoading || !formData.instituteCode
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={isLoading || !formData.instituteCode}
                    aria-label="Send OTP"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z" />
                      </svg>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                )}
              </div>
              {errors.phoneNo && (
                <p className="text-red-500 text-xs mt-1">{errors.phoneNo}</p>
              )}
            </div>
            <div className="hidden">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Institute Code *
              </label>
              <input
                type="text"
                name="instituteCode"
                value={formData.instituteCode}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400 ${
                  errors.instituteCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter institute code (e.g., METIOM)"
                disabled={isLoading || isOtpVerified}
                aria-invalid={errors.instituteCode ? 'true' : 'false'}
                aria-label="Institute Code"
              />
              {errors.instituteCode && (
                <p className="text-red-500 text-xs mt-1">{errors.instituteCode}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                disabled={isLoading || isOtpVerified}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-label="Password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
          </div>
          {isOtpSent && !isOtpVerified && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Enter OTP *
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400 ${
                    errors.otp ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter 6-digit OTP"
                  disabled={isLoading}
                  aria-invalid={errors.otp ? 'true' : 'false'}
                  aria-label="OTP"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className={`px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap ${
                    isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={isLoading}
                  aria-label="Verify OTP"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z" />
                    </svg>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className={`px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 whitespace-nowrap ${
                    isLoading || resendTimer > 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                  disabled={isLoading || resendTimer > 0}
                  aria-label="Resend OTP"
                >
                  {resendTimer > 0 ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h4m-4-8a8 8 0 110 16 8 8 0 010-16z" />
                      </svg>
                      Resend in {resendTimer}s
                    </span>
                  ) : (
                    'Resend OTP'
                  )}
                </button>
              </div>
              {errors.otp && (
                <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
              )}
            </div>
          )}
          <div className="flex justify-between items-center">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline transition-colors duration-200"
              aria-label="Login Link"
            >
              Already have an account? Login
            </Link>
            <button
              type="submit"
              onClick={() => isOtpVerified && navigate('/login')}
              className={`px-6 py-2 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 ${
                isOtpVerified
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!isOtpVerified}
              aria-label="Register Button"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;