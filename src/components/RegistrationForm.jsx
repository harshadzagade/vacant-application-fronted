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
    instituteCode: '',
  });
  const [otp, setOtp] = useState('');
  const [instituteId, setInstituteId] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors = {};
    if (!/^\d{6}$/.test(otp)) newErrors.otp = 'OTP must be 6 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const instituteName = async () => {
    try {
      console.log('Fetching institute name for code:', formData.instituteCode);
      
      const response = await axios.get(`https://admission.met.edu/api/auth/institute-name/${formData.instituteCode}`);
      console.log('Institute name response:', response.data);
      
      return response.data.name;
    }
    catch (error) {
      console.error('Error fetching institute name:', error);
      return 'Unknown Institute';
    } 
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
      const response = await axios.post('https://admission.met.edu/api/auth/register', {
        ...formData,
        code: formData.instituteCode,
      });
      console.log('Registration response:', response.data);
      
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
      const response = await axios.post('https://admission.met.edu/api/auth/resend-otp', {
        phoneNo: formData.phoneNo,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
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
      const response = await axios.post('https://admission.met.edu/api/auth/verify-otp', {
        ...formData,
        otp,
        instituteId,
        code: formData.instituteCode,
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Invalid OTP');
      }
      setIsOtpVerified(true);
      Swal.fire({
        title: 'Registration Successful',
        html: 'Username and password have been sent to your email.<br><strong>Please check your inbox.</strong>',
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
        <div className="flex justify-center mb-6">
          <img src="https://www.met.edu/frontendassets/images/MET_College_in_Mumbai_logo.png" alt="Logo" className="h-[5rem] w-auto" />
        </div>
        <h2 className="text-3xl font-bold mb-6 text-center text-red-600">Admissions Application for {instituteName}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <input
              name="middleName"
              placeholder="Middle Name"
              value={formData.middleName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <input
              name="phoneNo"
              placeholder="Phone Number"
              value={formData.phoneNo}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.phoneNo && <p className="text-red-500 text-sm mt-1">{errors.phoneNo}</p>}
          </div>
          <div>
            <input
              name="instituteCode"
              placeholder="Institute Code"
              value={formData.instituteCode}
              onChange={handleChange}
              className="hidden w-full p-3 border rounded-lg"
            />
            {errors.instituteCode && <p className="text-red-500 text-sm mt-1">{errors.instituteCode}</p>}
          </div>
          {isOtpSent && !isOtpVerified && (
            <div>
              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          )}
          {isOtpSent && !isOtpVerified && (
            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={handleVerifyOtp}
                className={`px-6 py-3 rounded-lg text-white font-semibold ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                onClick={handleResendOtp}
                className={`px-6 py-3 rounded-lg text-white font-semibold ${resendTimer > 0 || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={resendTimer > 0 || isLoading}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          )}
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
