import { useState, useEffect } from 'react';
import axios from 'axios';

const RegistrationForm = ({ onRegistrationSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNo: '',
    code: '', // Added for instituteCode
  });
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState('');
  const [instituteId, setInstituteId] = useState(null); // Changed from userId
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [apiError, setApiError] = useState('');

  // Extract instituteCode from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const instituteCode = urlParams.get('code');
    if (instituteCode) {
      setFormData(prev => ({ ...prev, code: instituteCode }));
    } else {
      setApiError('Institute code is missing in the URL');
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.phoneNo) newErrors.phoneNo = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phoneNo)) newErrors.phoneNo = 'Invalid phone number (10 digits required)';
    if (!formData.code) newErrors.code = 'Institute code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
    if (name === 'phoneNo' && isOtpSent) {
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setInstituteId(null);
      setOtp('');
    }
  };

  const handleSendOtp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNo: formData.phoneNo,
        code: formData.code,
      });
      setInstituteId(response.data.instituteId); // Store instituteId
      setIsOtpSent(true);
      setApiError('');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setErrors(prev => ({ ...prev, otp: 'Please enter the OTP' }));
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        phoneNo: formData.phoneNo,
        otp,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        instituteId, // Send instituteId from register response
      });
      setIsOtpVerified(true);
      setErrors(prev => ({ ...prev, otp: '' }));
      setApiError('');
      onRegistrationSuccess(); // Call success callback after verification
    } catch (error) {
      setErrors(prev => ({ ...prev, otp: error.response?.data?.message || 'Invalid OTP' }));
      setIsOtpVerified(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm() && isOtpVerified) {
      // No additional API call needed here since verifyOTP handles user creation
      onRegistrationSuccess();
    } else if (!isOtpVerified) {
      setApiError('Please verify OTP before registering');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-brand-700 text-sm font-medium mb-2">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
              errors.firstName ? 'border-red-500' : 'border-brand-200'
            }`}
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-brand-700 text-sm font-medium mb-2">Middle Name</label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            className="w-full p-3 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
          />
        </div>
        <div>
          <label className="block text-brand-700 text-sm font-medium mb-2">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
              errors.lastName ? 'border-red-500' : 'border-brand-200'
            }`}
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
        <div>
          <label className="block text-brand-700 text-sm font-medium mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
              errors.email ? 'border-red-500' : 'border-brand-200'
            }`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-brand-700 text-sm font-medium mb-2">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
              errors.password ? 'border-red-500' : 'border-brand-200'
            }`}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>
        <div>
          <label className="block text-brand-700 text-sm font-medium mb-2">Phone Number *</label>
          <div className="flex space-x-2">
            <input
              type="tel"
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                errors.phoneNo ? 'border-red-500' : 'border-brand-200'
              }`}
              disabled={isOtpVerified}
            />
            {!isOtpVerified && (
              <button
                type="button"
                onClick={handleSendOtp}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition shadow-md hover:shadow-lg whitespace-nowrap"
                disabled={isOtpSent || !formData.code}
              >
                {isOtpSent ? 'OTP Sent' : 'Send OTP'}
              </button>
            )}
          </div>
          {errors.phoneNo && <p className="text-red-500 text-xs mt-1">{errors.phoneNo}</p>}
          {apiError && !isOtpSent && <p className="text-red-500 text-xs mt-1">{apiError}</p>}
        </div>
        {isOtpSent && !isOtpVerified && (
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Enter OTP *</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                  errors.otp ? 'border-red-500' : 'border-brand-200'
                }`}
                placeholder="Enter 6-digit OTP"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition shadow-md hover:shadow-lg whitespace-nowrap"
              >
                Verify OTP
              </button>
            </div>
            {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
            {apiError && <p className="text-red-500 text-xs mt-1">{apiError}</p>}
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleSubmit}
          className={`px-6 py-2 rounded-lg transition shadow-md hover:shadow-lg ${
            isOtpVerified
              ? 'bg-brand-500 hover:bg-brand-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isOtpVerified}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;