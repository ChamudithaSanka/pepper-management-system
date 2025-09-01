import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Carousel from './Carousel';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      {/* Hero Carousel Section */}
      <section className="relative">
        <Carousel />
      </section>

      {/* Welcome Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-green-600">Ceylon Pepper</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover the finest Ceylon pepper and pepper-based products, sourced directly from Sri Lankan farms. 
            Experience authentic flavors that have made Ceylon pepper famous worldwide.
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors">
            Explore Our Products
          </button>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Featured <span className="text-green-600">Products</span>
          </h2>
          
          <div className="grid grid-cols-3 gap-8">
            {/* Product 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-lg font-medium">Product Image</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Black Pepper</h3>
                <p className="text-gray-600 mb-4">Hand-picked Ceylon black pepper with intense flavor and aroma.</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">$24.99</span>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Product 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-lg font-medium">Product Image</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fresh Green Pepper</h3>
                <p className="text-gray-600 mb-4">Aromatic green pepper corns perfect for gourmet cooking.</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">$19.99</span>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Product 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-lg font-medium">Product Image</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pepper Powder</h3>
                <p className="text-gray-600 mb-4">Finely ground Ceylon pepper powder for everyday cooking.</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">$15.99</span>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="border border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors">
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose <span className="text-green-400">Ceylon Pepper</span>?
          </h2>
          
          <div className="grid grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-green-400">Premium Quality</h3>
              <p className="text-gray-400">
                Hand-selected pepper from the finest Ceylon farms, ensuring superior quality and flavor.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-green-400">Fast Delivery</h3>
              <p className="text-gray-400">
                Quick and reliable delivery service to bring fresh Ceylon pepper to your doorstep.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-green-400">Customer Satisfaction</h3>
              <p className="text-gray-400">
                We prioritize customer satisfaction with excellent service and support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated with Ceylon Pepper
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Subscribe to our newsletter for exclusive offers and updates on new products.
          </p>
          
          <div className="flex justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-l-lg border-none focus:outline-none focus:ring-2 focus:ring-green-800"
            />
            <button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-r-lg font-medium transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;
