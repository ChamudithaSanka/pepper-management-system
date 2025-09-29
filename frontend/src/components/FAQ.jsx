import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Link } from 'react-router-dom';

const AccordionItem = ({ id, title, children, isOpen, onToggle }) => {
  return (
    <div className="border border-green-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
      <button
        aria-expanded={isOpen}
        aria-controls={`panel-${id}`}
        onClick={() => onToggle(id)}
        className="w-full text-left px-6 py-4 bg-gradient-to-r from-white to-green-50 hover:from-green-50 hover:to-green-100 flex items-center justify-between focus:outline-none transition-all duration-200"
      >
        <span className="text-lg font-medium text-gray-900">{title}</span>
        <svg
          className={`w-5 h-5 text-green-600 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        id={`panel-${id}`}
        role="region"
        className={`px-6 pb-4 bg-gradient-to-r from-blue-50 to-green-50 transition-max-h duration-300 overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="py-2 text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 to-blue-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12 bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg p-8 border border-green-200">
          <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 mt-2">Find answers to common questions about our products, shipping, and policies.</p>
          <div className="mt-4">
            <Link to="/shop" className="text-green-600 hover:underline">Back to shop</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AccordionItem id={1} title="What is CeylonPepper?" isOpen={openId === 1} onToggle={toggle}>
            <p className="leading-relaxed">CeylonPepper is a value-added pepper products company dedicated to bringing the rich flavor
                and heritage of Sri Lankan pepper to the world. We work closely with local farmers to source the finest pepper and transform
                 it into high-quality products such as spices, blends, and innovative pepper-based goods. Our goal is to deliver authentic taste, enhance everyday cooking, and support sustainable farming practices.
            </p>
          </AccordionItem>

          <AccordionItem id={2} title="How long does shipping take?" isOpen={openId === 2} onToggle={toggle}>
            <p className="leading-relaxed">Shipping usually takes 3-5 business days for orders. Delivery times may vary depending on your location.
                Once your order is shipped, you will receive a notification email.
</p>
          </AccordionItem>

          <AccordionItem id={3} title="Do you ship internationally?" isOpen={openId === 3} onToggle={toggle}>
            <p className="leading-relaxed">We currently do not offer international shipping, but we are working on making it available soon.
                                        Our goal is to share the taste of CeylonPepper with customers worldwide, and we hope to launch international 
                                        delivery in the near future.
            </p>
          </AccordionItem>

          <AccordionItem id={4} title="“Are your products 100% natural?”" isOpen={openId === 4} onToggle={toggle}>
            <p className="leading-relaxed">Yes, all our products are 100% natural. We use only high-quality pepper sourced from trusted 
                local farmers, with no artificial additives, preservatives, or fillers. Our goal is to deliver the pure, 
                authentic flavor of Ceylon Pepper straight from the farm to your kitchen.
            </p>
          </AccordionItem>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
