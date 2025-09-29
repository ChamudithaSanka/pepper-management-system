import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Carousel from './Carousel';

const Homepage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch featured products from database
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products/available?limit=3', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();
        if (data.success) {
          setFeaturedProducts(data.data);
        } else {
          setError(data.message || 'Failed to fetch products');
        }
      } catch (error) {
        setError('Error fetching featured products');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Helper function to get image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/images/placeholder-product.jpg'; // Fallback image
    if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) return imageUrl;
    return `/uploads/products/${imageUrl}`;
  };
  return (
    <div className="min-h-screen bg-green-100">
      <Header />
      
      {/* Hero Carousel Section */}
      <section className="relative">
        <Carousel />
      </section>

      {/* Welcome Section */}
      <section className="py-16 bg-green-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-green-600">Ceylon Pepper</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Discover the finest Ceylon pepper and pepper-based products, sourced directly from Sri Lankan farms. 
            Experience authentic flavors that have made Ceylon pepper famous worldwide.
          </p>
          <Link to="/shop" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors inline-block">
            Explore Our Products
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Featured <span className="text-green-600">Products</span>
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-xl text-gray-600">Loading featured products...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-xl text-red-600">Error: {error}</div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-xl text-gray-600">No featured products available</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product._id} className="bg-green-100 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200">
                  <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img 
                      src={getImageUrl(product.imageUrl)} 
                      alt={product.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-product.jpg';
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.productName}</h3>
                    <p className="text-gray-600 mb-4">{product.description || 'Premium quality Ceylon pepper product.'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">${product.price}</span>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Add to Cart
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {product.availableStock} {product.unit} available
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/shop" className="border border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors inline-block">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-900 text-white">
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
              <p className="text-gray-300">
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
              <p className="text-gray-300">
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
              <p className="text-gray-300">
                We prioritize customer satisfaction with excellent service and support.
              </p>
            </div>
          </div>
        </div>
      </section>

      

      <Footer />
    </div>
  );
};

export default Homepage;
