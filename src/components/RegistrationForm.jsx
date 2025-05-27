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

  // Extract instituteCode from URL (optional, as in provided code)
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
      const response = await axios.post('/api/auth/register', {
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
      setResendTimer(30); // Start 30-second cooldown
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
      setResendTimer(30); // Reset 30-second cooldown
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

      console.log(response.data);
      
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
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <h2 className="text-2xl font-semibold text-brand-900 border-b-2 border-brand-200 pb-2">
          Registration
        </h2>
        {serverError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
            {serverError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                errors.firstName ? 'border-red-500' : 'border-brand-200'
              }`}
              placeholder="Enter your first name"
              disabled={isLoading || isOtpVerified}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">
              Middle Name
            </label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                errors.middleName ? 'border-red-500' : 'border-brand-200'
              }`}
              placeholder="Enter your middle name"
              disabled={isLoading || isOtpVerified}
            />
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                errors.lastName ? 'border-red-500' : 'border-brand-200'
              }`}
              placeholder="Enter your last name"
              disabled={isLoading || isOtpVerified}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                errors.email ? 'border-red-500' : 'border-brand-200'
              }`}
              placeholder="Enter your email"
              disabled={isLoading || isOtpVerified}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">
              Phone Number *
            </label>
            <div className="flex space-x-2">
              <input
                type="tel"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                  errors.phoneNo ? 'border-red-500' : 'border-brand-200'
                }`}
                placeholder="Enter your phone number"
                disabled={isLoading || isOtpVerified}
              />
              {!isOtpSent && !isOtpVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className={`px-4 py-2 rounded-lg font-semibold text-white transition shadow-md hover:shadow-lg whitespace-nowrap ${
                    isLoading || !formData.instituteCode
                      ? 'bg-brand-300 cursor-not-allowed'
                      : 'bg-brand-500 hover:bg-brand-600'
                  }`}
                  disabled={isLoading || !formData.instituteCode}
                >
                  Send OTP
                </button>
              )}
            </div>
            {errors.phoneNo && (
              <p className="text-red-500 text-xs mt-1">{errors.phoneNo}</p>
            )}
          </div>
          <div hidden >
            <label className="block text-brand-700 text-sm font-medium mb-2">
              Institute Code *
            </label>
            <input
              type="text"
              name="instituteCode"
              value={formData.instituteCode}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                errors.instituteCode ? 'border-red-500' : 'border-brand-200'
              }`}
              placeholder="Enter institute code (e.g., METIOM)"
              disabled={isLoading || isOtpVerified}
            />
            {errors.instituteCode && (
              <p className="text-red-500 text-xs mt-1">{errors.instituteCode}</p>
            )}
          </div>
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                errors.password ? 'border-red-500' : 'border-brand-200'
              }`}
              placeholder="Enter your password"
              disabled={isLoading || isOtpVerified}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
        </div>
        {isOtpSent && !isOtpVerified && (
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">
              Enter OTP *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                  errors.otp ? 'border-red-500' : 'border-brand-200'
                }`}
                placeholder="Enter 6-digit OTP"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                className={`px-4 py-2 rounded-lg font-semibold text-white transition shadow-md hover:shadow-lg whitespace-nowrap ${
                  isLoading ? 'bg-brand-300 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600'
                }`}
                disabled={isLoading}
              >
                Verify OTP
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                className={`px-4 py-2 rounded-lg font-semibold text-white transition shadow-md hover:shadow-lg whitespace-nowrap ${
                  isLoading || resendTimer > 0
                    ? 'bg-brand-300 cursor-not-allowed'
                    : 'bg-brand-500 hover:bg-brand-600'
                }`}
                disabled={isLoading || resendTimer > 0}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
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
            className="text-brand-700 hover:text-brand-900 text-sm font-medium underline"
          >
            Already have an account? Login
          </Link>
          <button
            type="submit"
            onClick={() => isOtpVerified && navigate('/login')}
            className={`px-6 py-2 rounded-lg font-semibold text-white transition shadow-md hover:shadow-lg ${
              isOtpVerified
                ? 'bg-brand-500 hover:bg-brand-600'
                : 'bg-brand-300 cursor-not-allowed'
            }`}
            disabled={!isOtpVerified}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;