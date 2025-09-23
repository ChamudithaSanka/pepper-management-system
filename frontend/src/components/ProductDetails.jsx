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
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
            <p className="mt-4 text-gray-300 text-lg">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">Product Not Found</h2>
            <p className="text-gray-300 mb-8">{error}</p>
            <Link
              to="/shop"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-gray-400">
            <Link to="/" className="hover:text-green-400 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-green-400 transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-white">{product.productName}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-12 text-center">
              <div className="w-32 h-32 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-6xl">🌶️</span>
              </div>
              <p className="text-gray-400">Product Image</p>
            </div>
            
            {/* Additional Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{product.availableStock}</div>
                <div className="text-gray-400 text-sm">Available Stock</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">Rs. {product.price}</div>
                <div className="text-gray-400 text-sm">Per {product.unit}</div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div>
              <span className="inline-block bg-green-600 text-white text-sm px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{product.productName}</h1>
              <p className="text-xl text-gray-300">Product ID: {product.productId}</p>
            </div>

            {/* Price */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-baseline space-x-4">
                <span className="text-4xl font-bold text-green-400">Rs. {product.price}</span>
                <span className="text-gray-400">per {product.unit}</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Product Details */}
            <div className="bg-gray-900 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">Product Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Available: </span>
                  <span className="text-white font-medium">{product.availableStock} {product.unit}</span>
                </div>
                
                <div>
                  <span className="text-gray-400">Unit: </span>
                  <span className="text-white font-medium">{product.unit}</span>
                </div>
                
                <div>
                  <span className="text-gray-400">Category: </span>
                  <span className="text-white font-medium">{product.category}</span>
                </div>
                
                <div>
                  <span className="text-gray-400">Status: </span>
                  <span className="font-medium text-green-400">Available</span>
                </div>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Add to Cart</h3>
              
              <div className="flex items-center space-x-4 mb-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Quantity ({product.unit})</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.availableStock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.availableStock, parseInt(e.target.value) || 1)))}
                      className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-center focus:border-green-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.availableStock, quantity + 1))}
                      className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="text-gray-400 text-sm mb-2">Total Price</div>
                  <div className="text-2xl font-bold text-green-400">
                    Rs. {(product.price * quantity).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={addToCart}
                  disabled={addingToCart || product.availableStock === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>
                
                <Link
                  to="/shop"
                  className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors text-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Raw Material Recipe (if available) */}
            {product.rawMaterialRecipe && product.rawMaterialRecipe.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Ingredients</h3>
                <div className="space-y-2">
                  {product.rawMaterialRecipe.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">{ingredient.type}</span>
                      <span className="text-white">{ingredient.qtyPerUnitKg} kg per unit</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;
