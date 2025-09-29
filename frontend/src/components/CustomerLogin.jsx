import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Helper function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
  };

  // Helper function to validate password
  const isValidPassword = (password) => {
    return password.length > 0; // At minimum, password should not be empty
  };

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Apply validation based on field type
    if (e.target.name === 'email') {
      // Email validation - only allow valid email characters and prevent invalid formats
      // Remove any characters that don't match email pattern
      value = value.replace(/[^a-zA-Z0-9@._+-]/g, '');
      
      // Ensure there's only one @ symbol
      const atSymbolCount = (value.match(/@/g) || []).length;
      if (atSymbolCount > 1) {
        value = value.substring(0, value.lastIndexOf('@'));
        value = value.replace(/@/g, '');
        value += '@';
      }
      
      // Prevent double dots
      value = value.replace(/\.{2,}/g, '.');
      
      // Prevent @ at the beginning
      if (value.startsWith('@')) {
        value = '';
      }
      
      // Prevent multiple dots before @
      const atIndex = value.indexOf('@');
      if (atIndex !== -1) {
        const beforeAt = value.substring(0, atIndex);
        const afterAt = value.substring(atIndex);
        
        // Clean before @ symbol
        const cleanedBeforeAt = beforeAt.replace(/\.{2,}/g, '.');
        value = cleanedBeforeAt + afterAt;
      }
      
      // Removed overly restrictive "prevent dots at the very end" logic
      // Users should be able to type domains like "user@example.com"
      
      // Prevent multiple consecutive special characters
      value = value.replace(/[._+-]{2,}/g, '.');
      
    } else if (e.target.name === 'password') {
      // Password validation - remove whitespace and dangerous characters
      // Keep alphanumeric and common safe characters: !@#$%^&*()_+-=[]{}|;:,.<>?
      value = value.replace(/[\s\n\t\r]/g, ''); // Remove all whitespace
      value = value.replace(/[`"'~]/g, ''); // Remove potentially dangerous characters
      
      // Limit length (maximum 32 characters)
      if (value.length > 32) {
        value = value.substring(0, 32);
      }
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('/api/customers/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for sessions
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(true);
        setFormData({ email: '', password: '' });
        setTimeout(() => {
          // Trigger page reload to update header state
          window.location.href = '/';
        }, 1000);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 to-blue-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <div className="text-4xl font-bold text-green-600 mb-2">
              Ceylon<span className="text-gray-900">Pepper</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your customer account</p>
        </div>

        {/* Login Form */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-lg p-8 border border-green-200">
          {error && <div className="text-red-600 mb-4 p-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg shadow-sm">{error}</div>}
          {success && <div className="text-green-600 mb-4 p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg shadow-sm">Login successful!</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all duration-200 shadow-sm"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all duration-200 shadow-sm"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-600 focus:ring-2"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="text-green-600 hover:text-green-700 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Login Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Staff Login Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Are you a staff member?{' '}
            <Link to="/staff-login" className="text-green-600 hover:text-green-700 font-medium transition-colors">
              Staff Login
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link to="/" className="text-gray-600 hover:text-green-600 transition-colors inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
