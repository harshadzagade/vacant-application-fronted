import { useState } from 'react';

const RegistrationForm = ({ onRegistrationSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNo: ''
  });
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'phoneNo' && isOtpSent) {
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setGeneratedOtp(null);
      setOtp('');
    }
  };

  const handleSendOtp = () => {
    if (!formData.phoneNo) {
      setErrors(prev => ({ ...prev, phoneNo: 'Phone number is required' }));
      return;
    }
    if (!/^\d{10}$/.test(formData.phoneNo)) {
      setErrors(prev => ({ ...prev, phoneNo: 'Invalid phone number (10 digits required)' }));
      return;
    }
    
    // Simulate OTP generation (in a real app, this would be sent via SMS)
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setIsOtpSent(true);
    console.log('Generated OTP:', newOtp); // For demo purposes
    alert(`OTP sent to ${formData.phoneNo}: ${newOtp}`); // For demo purposes
  };

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      setIsOtpVerified(true);
      setErrors(prev => ({ ...prev, otp: '' }));
    } else {
      setErrors(prev => ({ ...prev, otp: 'Invalid OTP' }));
      setIsOtpVerified(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm() && isOtpVerified) {
      console.log('Registration data:', formData);
      onRegistrationSuccess();
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
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors.firstName ? 'border-red-500' : 'border-brand-200'}`}
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
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors.lastName ? 'border-red-500' : 'border-brand-200'}`}
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
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors.email ? 'border-red-500' : 'border-brand-200'}`}
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
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors.password ? 'border-red-500' : 'border-brand-200'}`}
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
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors.phoneNo ? 'border-red-500' : 'border-brand-200'}`}
              disabled={isOtpVerified}
            />
            {!isOtpVerified && (
              <button
                type="button"
                onClick={handleSendOtp}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition shadow-md hover:shadow-lg whitespace-nowrap"
                disabled={isOtpSent}
              >
                {isOtpSent ? 'OTP Sent' : 'Send OTP'}
              </button>
            )}
          </div>
          {errors.phoneNo && <p className="text-red-500 text-xs mt-1">{errors.phoneNo}</p>}
        </div>
        {isOtpSent && !isOtpVerified && (
          <div>
            <label className="block text-brand-700 text-sm font-medium mb-2">Enter OTP *</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${errors.otp ? 'border-red-500' : 'border-brand-200'}`}
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