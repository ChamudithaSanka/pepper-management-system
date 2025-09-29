import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    street: '',
    city: '',
    zipCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Helper function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
  };

  // Helper function to validate password
  const isValidPassword = (password) => {
    return password.length > 0; // At minimum, password should not be empty
  };

  // Helper function to validate name (letters, spaces, hyphens, apostrophes)
  const isValidName = (name) => {
    return /^[a-zA-Z\s\-']+$/.test(name);
  };

  // Helper function to validate phone number
  const isValidPhone = (phone) => {
    return /^[\d\s\-()+]*$/.test(phone);
  };

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Apply validation based on field type
    if (e.target.name === 'name') {
      // Name validation - only allow letters, spaces, hyphens, apostrophes
      // Allow spaces at the beginning, middle, and end for natural typing
      value = value.replace(/[^a-zA-Z\s\-']/g, '');
      
      // Prevent multiple consecutive spaces (but allow single spaces anywhere)
      value = value.replace(/\s{2,}/g, ' ');
      
    } else if (e.target.name === 'email') {
      // Email validation - only allow valid email characters and prevent invalid formats
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
      
    } else if (e.target.name === 'phone') {
      // Phone validation - only allow numbers and common phone formatting chars
      value = value.replace(/[^\d\s\-()+]/g, '');
      
      // Prevent multiple consecutive spaces
      value = value.replace(/\s{2,}/g, ' ');
      
      // Limit length (phone number should be 10 digits)
      if (value.length > 10) {
        value = value.substring(0, 10);
      }
      
    } else if (e.target.name === 'street') {
      // Street address validation - allow letters, numbers, spaces, common address chars
      value = value.replace(/[^a-zA-Z0-9\s\-.,#/]/g, '');
      
      // Prevent multiple consecutive spaces
      value = value.replace(/\s{2,}/g, ' ');
      
      // Limit length (200 chars as per model)
      if (value.length > 200) {
        value = value.substring(0, 200);
      }
      
    } else if (e.target.name === 'city') {
      // City validation - allow letters, spaces, hyphens
      value = value.replace(/[^a-zA-Z\s\-]/g, '');
      
      // Prevent multiple consecutive spaces
      value = value.replace(/\s{2,}/g, ' ');
      
      // Limit length (100 chars as per model)
      if (value.length > 100) {
        value = value.substring(0, 100);
      }
      
    } else if (e.target.name === 'zipCode') {
      // Zip code validation - only allow numbers for Sri Lankan postal codes
      value = value.replace(/[^0-9]/g, '');
      
      // Limit length (Sri Lankan postal codes are 5 digits)
      if (value.length > 5) {
        value = value.substring(0, 5);
      }
      
    } else if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      // Password validation - remove whitespace and dangerous characters
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
      const response = await fetch('/api/customers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for sessions
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          deliveryAddress: {
            street: formData.street,
            city: formData.city,
            zipCode: formData.zipCode,
            fullAddress: `${formData.street}, ${formData.city}, ${formData.zipCode}`,
            latitude: 0, // Default coordinates - customer can update later
            longitude: 0
          },
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          street: '',
          city: '',
          zipCode: ''
        });
        setTimeout(() => {
          // Redirect to login page after successful registration
          window.location.href = '/login';
        }, 1500);
      } else {
        setError(data.message || 'Registration failed');
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
        </div>

        {/* Registration Form */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-lg p-8 border border-green-200">
          {error && <div className="text-red-600 mb-4 p-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg shadow-sm">{error}</div>}
          {success && <div className="text-green-600 mb-4 p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg shadow-sm">Account created successfully!</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all duration-200 shadow-sm"
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>

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
                className="w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all duration-200 shadow-sm"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all duration-200 shadow-sm"
                placeholder="Enter your phone number"
                autoComplete="tel"
              />
            </div>

            {/* Delivery Address Fields */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Delivery Address
              </label>
              
              {/* Street Address */}
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  id="street"
                  name="street"
                  type="text"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all duration-200 shadow-sm"
                  placeholder="Enter street address"
                  autoComplete="street-address"
                />
              </div>

              {/* City and Zip Code */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all duration-200 shadow-sm"
                    placeholder="Enter city"
                    autoComplete="address-level2"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all duration-200 shadow-sm"
                    placeholder="Enter zip code"
                    autoComplete="postal-code"
                  />
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
                  placeholder="Create a password"
                  autoComplete="new-password"
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all duration-200 shadow-sm"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
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

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 text-green-600 border-green-300 rounded focus:ring-green-600 focus:ring-2 mt-1 shadow-sm"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-green-600 hover:text-green-700">
                  Terms and Conditions
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-green-600 hover:text-green-700">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Register Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!agreeToTerms || loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                Sign in here
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

export default CustomerRegister;
