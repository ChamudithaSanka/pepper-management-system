import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check session on component mount
  useEffect(() => {
    checkSession();
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
  
  const handleLogout = async () => {
    try {
      await fetch('/api/customers/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-black text-white shadow-lg">
      {/* Top Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-green-400">
              Ceylon<span className="text-white">Pepper</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for pepper products..."
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none"
              />
              <button className="absolute right-2 top-2 text-green-400 hover:text-green-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Login/Register & Cart */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link to="/customer-dashboard" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors">
                  Customer Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="border border-red-600 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="border border-green-600 text-green-400 hover:bg-green-600 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Register
                </Link>
              </>
            )}
            <button className="relative text-green-400 hover:text-green-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4H19" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-4">
          <ul className="flex space-x-8">
            <li>
              <a href="#" className="text-green-400 hover:text-green-300 font-medium border-b-2 border-green-400 pb-1">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="text-white hover:text-green-400 font-medium transition-colors">
                Shop
              </a>
            </li>
            <li>
              <a href="#" className="text-white hover:text-green-400 font-medium transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="#" className="text-white hover:text-green-400 font-medium transition-colors">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="text-white hover:text-green-400 font-medium transition-colors">
                FAQ
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
