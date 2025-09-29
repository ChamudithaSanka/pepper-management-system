import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const StaffLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('/api/users/login', {
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
          // Redirect based on user role (fix: use data.data.role)
          const role = data.data?.role;
          if (role === 'Admin') {
            window.location.href = '/admin';
          } else if (role === 'Finance Manager') {
            window.location.href = '/finance';
          } else if (role === 'Inventory Manager') {
            window.location.href = '/inventory';
          } else {
            window.location.href = '/';
          }
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <div className="text-4xl font-bold text-green-600 mb-2">
              Ceylon<span className="text-gray-900">Pepper</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Staff Portal</h2>
          <p className="text-gray-600">Sign in to your staff account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {error && <div className="text-red-600 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
          {success && <div className="text-green-600 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">Login successful!</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors"
                placeholder="Enter your staff email"
                autoComplete="email"
              />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors"
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

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Access restricted to authorized staff</span>
              </div>
            </div>

            {/* Customer Login Link */}
            <div className="text-center">
              <span className="text-gray-600">Are you a customer? </span>
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                Customer Login
              </Link>
            </div>
          </form>
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

export default StaffLogin;
