import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({});
  const [addingToCart, setAddingToCart] = useState({});

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      queryParams.append('page', filters.page);
      queryParams.append('limit', filters.limit);

      const response = await fetch(`/api/customers/products?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
        setPagination({
          totalPages: data.totalPages,
          currentPage: data.currentPage,
          totalProducts: data.totalProducts
        });
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      setError('Error fetching products');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for filter dropdown
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/customers/products/categories', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Add product to cart
  const addToCart = async (productId, productName) => {
    try {
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      
      // Get customer session first
      const sessionResponse = await fetch('/api/customers/session', {
        method: 'GET',
        credentials: 'include',
      });

      const sessionData = await sessionResponse.json();
      if (!sessionData.success || !sessionData.isLoggedIn) {
        alert('Please login to add products to cart');
        return;
      }

      const customerId = sessionData.customer.customerId;

      const response = await fetch(`/api/customers/${customerId}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: productId,
          quantity: 1
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`${productName} added to cart successfully!`);
        // Trigger a page refresh to update cart count in header
        window.location.reload();
      } else {
        alert(data.message || 'Failed to add product to cart');
      }
    } catch (error) {
      alert('Error adding product to cart');
      console.error('Error:', error);
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) return imageUrl;
    return `/uploads/${imageUrl}`;
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ceylon Pepper <span className="text-green-600">Products</span></h1>
          <p className="text-gray-700 text-lg">Premium Quality Pepper Products from Sri Lanka</p>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={filters.search}
                onChange={(e) => {
                  // Allow only letters, numbers and spaces in search
                  const raw = e.target.value;
                  const sanitized = raw.replace(/[^a-zA-Z0-9\s]/g, '');
                  handleFilterChange('search', sanitized);
                }}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ category: '', search: '', page: 1, limit: 12 })}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {pagination.totalProducts > 0 && (
          <div className="mb-6">
            <p className="text-gray-700">
              Showing {products.length} of {pagination.totalProducts} products
              {filters.search && ` for "${filters.search}"`}
              {filters.category && ` in "${filters.category}"`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-700">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
                    {/* Product Image (use uploaded image when available) */}
                    <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={getImageSrc(product.imageUrl)}
                          alt={product.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span className="text-2xl">🌶️</span>
                          </div>
                          <p className="text-gray-500 text-sm">Product Image</p>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-6">
                      <div className="mb-2">
                        <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.productName}</h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description || 'Premium quality Ceylon pepper product'}
                      </p>

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-2xl font-bold text-green-600">
                            LKR {product.price}
                          </span>
                          <span className="text-gray-600 text-sm">
                            per {product.unit}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            Stock: {product.availableStock} {product.unit}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                            Available
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link
                          to={`/product/${product._id}`}
                          className="flex-1 border border-gray-300 hover:border-gray-400 bg-white text-gray-900 py-2 px-4 rounded-lg font-medium transition-colors text-center"
                        >
                          View Details
                        </Link>
                        
                        <button
                          onClick={() => addToCart(product._id, product.productName)}
                          disabled={addingToCart[product._id]}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          {addingToCart[product._id] ? 'Adding...' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
                <p className="text-gray-600">
                  {filters.search || filters.category 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No products are currently available'
                  }
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 border border-gray-300 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 bg-white text-gray-900 rounded-lg transition-colors"
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        pagination.currentPage === index + 1
                          ? 'bg-green-600 text-white'
                          : 'bg-white border border-gray-300 hover:border-gray-400 text-gray-900'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 bg-white text-gray-900 rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductListing;
