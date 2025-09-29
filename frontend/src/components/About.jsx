import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 to-blue-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-16">
        <section className="text-center mb-12 bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg p-8 border border-green-200">
          <h1 className="text-3xl font-bold text-gray-900">About CeylonPepper</h1>
          <p className="text-lg text-gray-600 mt-3">Learn about our mission, story, and commitment to quality.</p>
          <div className="mt-4">
            <Link to="/shop" className="text-green-600 hover:underline">Shop our products</Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12 bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-8 border border-blue-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-700 leading-relaxed">Placeholder text about the history and origins of Ceylon Pepper. Replace this with your real company story describing how you source pepper, your values, and what sets you apart.</p>
          </div>
          <div className="rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 h-64 flex items-center justify-center shadow-md">
            <img src="images/about.png" alt="about" width="auto" height="80%" />
          </div>
        </section>

        <section className="mb-12 bg-gradient-to-r from-white to-green-50 rounded-xl shadow-lg p-8 border border-green-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">Our mission is to deliver the highest quality pepper products while promoting sustainable practices and empowering
             local farmers. We are committed to building a transparent, eco-conscious supply chain that ensures fair opportunities for growers, preserves the environment
              for future generations, and brings authentic, farm-to-market freshness to our customers worldwide</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-100 to-green-200 border-l-4 border-green-500 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-medium text-green-700">Quality</h3>
            <p className="text-gray-700">We source the finest pepper from trusted farms to ensure superior flavor.</p>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 border-l-4 border-blue-500 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-medium text-blue-700">Sustainability</h3>
            <p className="text-gray-700">We are committed to sustainable farming practices and fair compensation for farmers.</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 border-l-4 border-yellow-500 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-medium text-yellow-700">Customer First</h3>
            <p className="text-gray-700">Customer satisfaction is our priority — we stand behind our products.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
