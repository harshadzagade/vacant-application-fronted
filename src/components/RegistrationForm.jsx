import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

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
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) setFormData((prev) => ({ ...prev, instituteCode: code }));
  }, []);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = 'Valid email is required';
    if (!/^\d{10}$/.test(formData.phoneNo)) newErrors.phoneNo = 'Phone number must be 10 digits';
    if (!formData.instituteCode) newErrors.instituteCode = 'Institute code is required';

    // eslint-disable-next-line no-useless-escape
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,}$/;
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters long, with at least one lowercase letter, one uppercase letter, one number, and one special character (!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors = {};
    if (!/^\d{6}$/.test(otp)) newErrors.otp = 'OTP must be 6 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'email' ? value.trim() : value }));
    if (name === 'phoneNo') {
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtp('');
      setResendTimer(0);
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await axios.post('https://vacantseats.met.edu/api/auth/register', {
        ...formData,
        code: formData.instituteCode,
      });
      setInstituteId(response.data.instituteId);
      setIsOtpSent(true);
      setResendTimer(30);
      Swal.fire('OTP Sent', 'Check your email and phone', 'success');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      const response = await axios.post('https://vacantseats.met.edu/api/auth/resend-otp', {
        ...formData,
        code: formData.instituteCode,
      });
      setInstituteId(response.data.instituteId);
      setResendTimer(30);
      Swal.fire('OTP Resent', 'New OTP sent successfully', 'success');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to resend OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;
    setIsLoading(true);
    try {
      const response = await axios.post('https://vacantseats.met.edu/api/auth/verify-otp', {
        ...formData,
        otp,
        instituteId,
        code: formData.instituteCode,
      });
      if (response.data.status !== 'success' && !response.data.success) {
        throw new Error(response.data.message || 'Invalid OTP');
      }
      setIsOtpVerified(true);
      Swal.fire({
        title: 'Registration Successful',
        text: 'Please login using credentials sent on your email.',
        icon: 'success',
        confirmButtonText: 'Go to Login',
      }).then(() => navigate('/login'));
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Invalid OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 max-w-3xl w-full bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">User Registration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <input
              name="middleName"
              placeholder="Middle Name"
              value={formData.middleName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <input
              name="phoneNo"
              placeholder="Phone Number"
              value={formData.phoneNo}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.phoneNo && <p className="text-red-500 text-sm mt-1">{errors.phoneNo}</p>}
          </div>
          <div>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-1">
              <input
                type="checkbox"
                id="show-password"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label
                htmlFor="show-password"
                className="ml-2 text-sm"
                aria-label={showPassword ? 'Hide password' : 'Show password'} // Bug 2: Added aria-label for accessibility
              >
                Show Password
              </label>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <div>
            <input
              name="instituteCode"
              placeholder="Institute Code"
              value={formData.instituteCode}
              onChange={handleChange}
              className="hidden w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.instituteCode && <p className="text-red-500 text-sm mt-1">{errors.instituteCode}</p>}
          </div>
          {isOtpSent && !isOtpVerified && (
            <div>
              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
            </div>
          )}
        </div>
        <div className="mt-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          {!isOtpSent && (
            <button
              onClick={handleSendOtp}
              className={`w-full md:w-auto px-6 py-3 rounded-lg text-white font-semibold flex items-center justify-center ${formData.instituteCode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
              disabled={!formData.instituteCode || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </div>
              ) : (
                'Send OTP'
              )}
            </button>
          )}
          {isOtpSent && !isOtpVerified && (
            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={handleVerifyOtp}
                className={`px-6 py-3 rounded-lg text-white font-semibold flex items-center justify-center ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </button>
              <button
                onClick={handleResendOtp}
                className={`px-6 py-3 rounded-lg text-white font-semibold flex items-center justify-center ${resendTimer > 0 || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={resendTimer > 0 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resending...
                  </div>
                ) : (
                  resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'
                )}
              </button>
            </div>
          )}
          <div className="flex gap-4">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;