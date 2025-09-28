import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  // Check session on component mount
  useEffect(() => {
    checkSession();
    fetchCartCount();
  }, []);
  
  const checkSession = async () => {
    try {
      const response = await fetch('/api/customers/session', {
        credentials: 'include'
      });
      const data = await response.json();
      setIsLoggedIn(data.isLoggedIn);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      // Get customer session first
      const sessionResponse = await fetch('/api/customers/session', {
        credentials: 'include'
      });
      const sessionData = await sessionResponse.json();
      
      if (!sessionData.success || !sessionData.isLoggedIn) {
        setCartCount(0);
        return;
      }

      const customerId = sessionData.customer.customerId;
      const response = await fetch(`/api/customers/${customerId}/cart/count`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCartCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };
  
  const handleLogout = async () => {
    try {
      await fetch('/api/customers/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setIsLoggedIn(false);
      setCartCount(0);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-amber-100 text-gray-800 shadow-lg border-b border-gray-200">
      {/* Top Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/images/logo1.png" 
                alt="Ceylon Pepper Logo" 
                className="h-10 w-10 mr-3"
              />
              <span className="text-2xl font-bold text-green-600">
                Ceylon<span className="text-gray-900">Pepper</span>
              </span>
            </Link>
          </div>

          {/* Navigation Menu - Centered */}
          <nav className="flex-1 flex justify-center">
            <ul className="flex space-x-8">
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) => `font-medium pb-1 ${isActive ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-700 hover:text-green-600'}`}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/shop"
                  className={({ isActive }) => `font-medium ${isActive ? 'text-green-600 border-b-2 border-green-600 pb-1' : 'text-gray-700 hover:text-green-600'}`}
                >
                  Shop
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) => `font-medium ${isActive ? 'text-green-600 border-b-2 border-green-600 pb-1' : 'text-gray-700 hover:text-green-600'}`}
                >
                  About
                </NavLink>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <NavLink
                  to="/faq"
                  className={({ isActive }) => `font-medium ${isActive ? 'text-green-600 border-b-2 border-green-600 pb-1' : 'text-gray-700 hover:text-green-600'}`}
                >
                  FAQ
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Login/Register & Cart */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link to="/customer-dashboard" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="border border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Register
                </Link>
              </>
            )}
            <Link to="/cart" className="relative text-green-600 hover:text-green-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4H19" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
