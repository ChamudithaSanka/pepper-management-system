import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product details
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/customers/products/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
      } else {
        setError(data.message || 'Product not found');
      }
    } catch (error) {
      setError('Error fetching product details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add product to cart
  const addToCart = async () => {
    try {
      setAddingToCart(true);
      
      // Get customer session first
      const sessionResponse = await fetch('/api/customers/session', {
        method: 'GET',
        credentials: 'include',
      });

      const sessionData = await sessionResponse.json();
      if (!sessionData.success || !sessionData.isLoggedIn) {
        alert('Please login to add products to cart');
        navigate('/login');
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
          productId: product._id,
          quantity: quantity
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`${quantity} ${product.unit}(s) of ${product.productName} added to cart successfully!`);
        // Trigger a page refresh to update cart count in header
        window.location.reload();
      } else {
        alert(data.message || 'Failed to add product to cart');
      }
    } catch (error) {
      alert('Error adding product to cart');
      console.error('Error:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 text-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-700 text-lg">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 text-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-500 mb-4">Product Not Found</h2>
            <p className="text-gray-700 mb-8">{error}</p>
            <Link
              to="/shop"
              className="inline-block bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Back to Shop
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 text-gray-900">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-gray-500">
            <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-green-600 transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-green-700 font-bold">{product.productName}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image & Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg border border-green-200 p-10 text-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.productName} className="w-40 h-40 object-cover rounded-lg mx-auto mb-4" />
              ) : (
                <div className="w-32 h-32 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-6xl">🌶️</span>
                </div>
              )}
              <p className="text-gray-500">Product Image</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 text-center border border-green-200 shadow-sm">
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Rs. {product.price}</div>
              <div className="text-gray-600 text-sm">Per {product.unit}</div>
              {typeof product.availableStock !== 'undefined' && (
                <div className="mt-2 text-green-700 font-semibold text-sm">
                  Available Stock: {product.availableStock} {product.unit}{product.availableStock === 1 ? '' : 's'}
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Category Badge */}
            <div>
              <span className="inline-block bg-gradient-to-r from-green-100 to-green-200 text-green-700 text-sm px-3 py-1 rounded-full shadow-sm">
                {product.category}
              </span>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.productName}</h1>
              <p className="text-lg text-gray-500">Product ID: {product.productId}</p>
            </div>

            {/* Size */}
            {product.size && (
              <div>
                <span className="text-gray-500 font-medium">Size: </span>
                <span className="text-gray-900 font-semibold">{product.size}</span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg border border-green-200 shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Add to Cart</h3>

              <div className="flex items-center space-x-4 mb-6">
                <div>
                  <label className="block text-gray-500 text-sm mb-2">Quantity ({product.unit})</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-bold transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.availableStock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.availableStock, parseInt(e.target.value) || 1)))}
                      className="w-20 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-gray-900 text-center focus:border-green-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.availableStock, quantity + 1))}
                      className="w-10 h-10 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-gray-500 text-sm mb-2">Total Price</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    Rs. {(product.price * quantity).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={addToCart}
                  disabled={addingToCart || product.availableStock === 0}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-300 disabled:to-green-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>

                <Link
                  to="/shop"
                  className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 py-3 px-6 rounded-lg font-medium transition-all duration-200 text-center border border-blue-200 shadow-sm hover:shadow-md"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;
