import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-800 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="text-2xl font-bold text-green-600 mb-4">
              Ceylon<span className="text-gray-800">Pepper</span>
            </div>
            <p className="text-gray-600 mb-4">
              Premium quality Ceylon pepper and pepper-based products, sourced directly from Sri Lankan farms.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-green-600 rounded-full"></div>
              <div className="w-8 h-8 bg-green-600 rounded-full"></div>
              <div className="w-8 h-8 bg-green-600 rounded-full"></div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:text-green-600 transition-colors">Home</Link></li>
              <li><Link to="/shop" className="text-gray-600 hover:text-green-600 transition-colors">Shop All Products</Link></li>
              <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Black Pepper</a></li>
              <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Green Pepper</a></li>
              <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Processed Products</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Returns</a></li>
              <li><a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Track Order</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-600">Colombo, Sri Lanka</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-600">+94 11 123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600">info@ceylonpepper.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              © 2025 Ceylon Pepper. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Cookie Policy</a>
              <a href="/staff-login" className="text-red-500 hover:text-red-600 transition-colors">Staff Login</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
