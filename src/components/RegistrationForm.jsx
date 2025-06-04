// ✅ Full Updated RegistrationForm with SweetAlert2, improved OTP handling, and loader feedback

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
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
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
      setFormData({ firstName: '', middleName: '', lastName: '', email: '', phoneNo: '', password: '', instituteCode: '' });
      setOtp('');
      setIsOtpSent(false);
      setResendTimer(0);
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
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">User Registration</h2>
      <div className="grid grid-cols-1 gap-4">
        <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="input" />
        <input name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleChange} className="input" />
        <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="input" />
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="input" />
        <input name="phoneNo" placeholder="Phone Number" value={formData.phoneNo} onChange={handleChange} className="input" />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} className="input" />
        {isOtpSent && !isOtpVerified && (
          <>
            <input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="input" />
            <div className="flex gap-4">
              <button onClick={handleVerifyOtp} className="btn-primary" disabled={isLoading}>Verify OTP</button>
              <button onClick={handleResendOtp} className="btn-secondary" disabled={resendTimer > 0 || isLoading}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </>
        )}
        {!isOtpSent && (
          <button onClick={handleSendOtp} className="btn-primary" disabled={isLoading}>Send OTP</button>
        )}
        <div className="flex justify-between mt-4">
          <Link to="/login" className="text-sm text-blue-600 underline">Already have an account? Login</Link>
          <button onClick={() => isOtpVerified && navigate('/login')} className="btn-success" disabled={!isOtpVerified}>Register</button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
