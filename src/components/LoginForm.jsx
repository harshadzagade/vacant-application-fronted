import { useState } from 'react';
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
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const trimmedUsername = formData.username.trim();
    if (!trimmedUsername) newErrors.username = 'Username is required';
    else if (!/^[A-Z0-9]{8}\d{3}$/.test(trimmedUsername)) newErrors.username = 'Invalid username format (e.g., METIOM25001)';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      // Bug 3: Updated password validation to match RegistrationForm
      // eslint-disable-next-line no-useless-escape
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters long, with at least one lowercase letter, one uppercase letter, one number, and one special character (!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'username' ? value.trim() : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
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
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                errors.username ? 'border-red-500' : 'border-brand-200'
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
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${
                  errors.password ? 'border-red-500' : 'border-brand-200'
                }`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-700 hover:text-brand-900"
                aria-label={showPassword ? 'Hide password' : 'Show password'} // Bug 2: Added aria-label for accessibility
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
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
              className={`px-6 py-2 rounded-lg font-semibold text-white transition shadow-md hover:shadow-lg ${
                isLoading
                  ? 'bg-brand-300 cursor-not-allowed'
                  : 'bg-brand-500 hover:bg-brand-600'
              }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;