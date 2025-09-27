import React, { useState, useEffect } from 'react';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [restockingProduct, setRestockingProduct] = useState(null);
    const [restockAmount, setRestockAmount] = useState('');
    const [rawMaterials, setRawMaterials] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');

    // Category-based size and unit options
    const getSizeOptions = (category) => {
        switch (category) {
            case 'Pepper Powder':
                return ['50 g', '100 g', '250 g', '500 g', '1 kg'];
            case 'Pepper Whole':
                return ['50 g', '100 g', '250 g', '500 g', '1 kg'];
            case 'Pepper Spray':
                return ['30 g', '50 g', '100 g'];
            case 'Pepper Sauce':
                return ['100 ml', '200 ml', '250 ml', '500 ml', '1 L'];
            case 'Pepper Oil':
                return ['100 ml', '250 ml', '500 ml', '1 L'];
            case 'Others':
                return ['50 g', '100 g', '250 g', '500 g', '1 kg', '100 ml', '250 ml', '500 ml', '1 L'];
            default:
                return [];
        }
    };

    const getUnitForCategory = (category) => {
        switch (category) {
            case 'Pepper Powder':
                return 'Packets';
            case 'Pepper Whole':
                return 'Packets';
            case 'Pepper Spray':
                return 'Bottles';
            case 'Pepper Sauce':
                return 'Bottles';
            case 'Pepper Oil':
                return 'Bottles';
            case 'Others':
                return ''; // Others category still allows manual selection
            default:
                return '';
        }
    };

    const getUnitOptions = (category) => {
        switch (category) {
            case 'Others':
                return ['grams', 'kg', 'ml', 'liters', 'pieces', 'bottles', 'packets'];
            default:
                return [];
        }
    };
    // Helper to get correct image source
    const getImageSrc = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) return imageUrl;
        return `/uploads/${imageUrl}`;
    };

    // Form state
    const [formData, setFormData] = useState({
        productName: '',
        description: '',
        category: '',
        size: '',
        unit: '',
        price: '',
        currentStock: '',
        safetyStock: '',
        reorderLevel: '',
        rawMaterialRecipe: []
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchRawMaterials();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/products', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setProducts(data.data || []);
            } else {
                setError('Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Error fetching products');
        } finally {
            setLoading(false);
        }
    };

    const fetchRawMaterials = async () => {
        try {
            const response = await fetch('/api/raw-materials', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setRawMaterials(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching raw materials:', error);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        try {
            const response = await fetch('/api/products/upload-image', {
                method: 'POST',
                credentials: 'include',
                body: imageFormData
            });

            if (response.ok) {
                const result = await response.json();
                return result.data.imageUrl;
            } else {
                throw new Error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Clear any previous errors

        try {
            // Upload image first if there's one
            let imageUrl = editingProduct?.imageUrl || null;
            if (imageFile) {
                imageUrl = await uploadImage();
            }

            const productData = {
                ...formData,
                imageUrl,
                price: parseFloat(formData.price),
                currentStock: parseInt(formData.currentStock) || 0,
                safetyStock: parseInt(formData.safetyStock) || 0,
                reorderLevel: parseInt(formData.reorderLevel),
                rawMaterialRecipe: formData.rawMaterialRecipe.filter(recipe => 
                    recipe.type && recipe.qtyPerUnitKg && recipe.wastePercentage
                )
            };

            console.log('Sending product data:', productData); // Debug log

            const url = editingProduct 
                ? `/api/products/${editingProduct._id}`
                : '/api/products';
            
            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(productData)
            });

            const responseData = await response.json();

            if (response.ok) {
                fetchProducts();
                resetForm();
                alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
            } else {
                console.error('Error response:', responseData);
                setError(responseData.error || 'Failed to save product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            setError('Network error: Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setError(''); // Clear any errors when opening edit modal
        setEditingProduct(product);
        setFormData({
            productName: product.productName,
            description: product.description || '',
            category: product.category,
            size: product.size || '',
            unit: product.unit,
            price: product.price.toString(),
            currentStock: product.currentStock.toString(),
            safetyStock: (product.safetyStock || 0).toString(),
            reorderLevel: product.reorderLevel.toString(),
            rawMaterialRecipe: product.rawMaterialRecipe || []
        });
    setImagePreview(product.imageUrl ? getImageSrc(product.imageUrl) : null);
        setShowEditModal(true);
    };

    const handleDelete = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                fetchProducts();
                alert('Product deleted successfully!');
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    };

    const handleToggleStatus = async (product) => {
        const newStatus = product.status === 'Active' ? 'Inactive' : 'Active';
        const action = newStatus === 'Active' ? 'activate' : 'deactivate';
        
        if (!confirm(`Are you sure you want to ${action} this product?`)) return;

        try {
            const response = await fetch(`/api/products/${product._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...product,
                    status: newStatus
                })
            });

            if (response.ok) {
                fetchProducts();
                alert(`Product ${action}d successfully!`);
            } else {
                const errorData = await response.json();
                alert(errorData.error || `Failed to ${action} product`);
            }
        } catch (error) {
            console.error(`Error ${action}ing product:`, error);
            alert(`Error ${action}ing product`);
        }
    };

    const handleRestock = (product) => {
        setRestockingProduct(product);
        setRestockAmount('');
        setShowRestockModal(true);
    };

    const submitRestock = async (e) => {
        e.preventDefault();
        
        const amount = parseInt(restockAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid positive number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const newStock = restockingProduct.currentStock + amount;
            const response = await fetch(`/api/products/${restockingProduct._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...restockingProduct,
                    currentStock: newStock
                })
            });

            if (response.ok) {
                fetchProducts();
                setShowRestockModal(false);
                setRestockingProduct(null);
                setRestockAmount('');
                alert(`Successfully restocked ${restockingProduct.productName} with ${amount} ${restockingProduct.unit}. New stock: ${newStock} ${restockingProduct.unit}`);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to restock product');
            }
        } catch (error) {
            console.error('Error restocking product:', error);
            setError('Error restocking product');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            productName: '',
            description: '',
            category: '',
            size: '',
            unit: '',
            price: '',
            currentStock: '',
            safetyStock: '',
            reorderLevel: '',
            rawMaterialRecipe: []
        });
        setImageFile(null);
        setImagePreview(null);
        setShowAddModal(false);
        setShowEditModal(false);
        setShowRestockModal(false);
        setEditingProduct(null);
        setRestockingProduct(null);
        setRestockAmount('');
        setError(''); // Clear errors when resetting form
    };

    const addRecipeItem = () => {
        setFormData(prev => ({
            ...prev,
            rawMaterialRecipe: [
                ...prev.rawMaterialRecipe,
                { type: '', qtyPerUnitKg: '', wastePercentage: '' }
            ]
        }));
    };

    const updateRecipeItem = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            rawMaterialRecipe: prev.rawMaterialRecipe.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const removeRecipeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            rawMaterialRecipe: prev.rawMaterialRecipe.filter((_, i) => i !== index)
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Inactive':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStockStatusColor = (stockStatus) => {
        switch (stockStatus) {
            case 'InStock':
                return 'bg-blue-100 text-blue-800';
            case 'LowStock':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredProducts = products.filter(product => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'low-stock') return product.stockStatus === 'LowStock';
        if (filterStatus === 'active') return product.status === 'Active';
        if (filterStatus === 'inactive') return product.status === 'Inactive';
        return product.status === filterStatus;
    });

    const stats = {
        total: products.length,
        lowStock: products.filter(p => p.stockStatus === 'LowStock').length,
        active: products.filter(p => p.status === 'Active').length,
        inactive: products.filter(p => p.status === 'Inactive').length
    };

    if (loading && products.length === 0) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                    <p className="text-center text-gray-500 mt-2">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                    <p className="text-gray-600 mt-1">Manage your pepper products and inventory</p>
                </div>
                <button
                    onClick={() => {
                        setError('');
                        setShowAddModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Product
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                    <button 
                        onClick={() => setError('')}
                        className="ml-2 text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Active Products</h3>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Inactive Products</h3>
                    <p className="text-2xl font-bold text-orange-600">{stats.inactive}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
                    <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex space-x-2">
                {[
                    { key: 'all', label: 'All Products' },
                    { key: 'active', label: 'Active' },
                    { key: 'inactive', label: 'Inactive' },
                    { key: 'low-stock', label: 'Low Stock' }
                ].map(filter => (
                    <button
                        key={filter.key}
                        onClick={() => setFilterStatus(filter.key)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filterStatus === filter.key 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Product Inventory</h3>
                </div>
                
                {filteredProducts.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
                        <p className="text-gray-500">
                            {filterStatus === 'all' 
                                ? 'No products have been added yet' 
                                : `No ${filterStatus.replace('-', ' ')} products found`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Size
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Unit
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price ($)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Current Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Safety Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ROL
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    {product.imageUrl ? (
                                                        <img 
                                                            src={getImageSrc(product.imageUrl)}
                                                            alt={product.productName}
                                                            className="h-12 w-12 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.productName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {product.productId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.size || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${product.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="max-w-xs truncate">
                                                {product.description || 'No description'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.currentStock} {product.unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.safetyStock || 0} {product.unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.reorderLevel} {product.unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(product.stockStatus)}`}>
                                                {product.stockStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => handleEdit(product)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleRestock(product)}
                                                    className="text-green-600 hover:text-green-900"
                                                    disabled={product.status === 'Inactive'}
                                                    title={product.status === 'Inactive' ? 'Cannot restock inactive product' : 'Restock product'}
                                                >
                                                    Restock
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleStatus(product)}
                                                    className={`${product.status === 'Active' ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                                >
                                                    {product.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(product._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Product Modal */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h3>
                            
                            {/* Error Display in Modal */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                    {error}
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Basic Information */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Product Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.productName}
                                            onChange={(e) => setFormData(prev => ({...prev, productName: e.target.value}))}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category *
                                        </label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => {
                                                const selectedCategory = e.target.value;
                                                const autoUnit = getUnitForCategory(selectedCategory);
                                                setFormData(prev => ({
                                                    ...prev, 
                                                    category: selectedCategory,
                                                    size: '', // Reset size when category changes
                                                    unit: autoUnit // Auto-set unit based on category
                                                }));
                                            }}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Pepper Powder">Pepper Powder</option>
                                            <option value="Pepper Whole">Pepper Whole</option>
                                            <option value="Pepper Spray">Pepper Spray</option>
                                            <option value="Pepper Sauce">Pepper Sauce</option>
                                            <option value="Pepper Oil">Pepper Oil</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Size *
                                        </label>
                                        <select
                                            required
                                            value={formData.size}
                                            onChange={(e) => setFormData(prev => ({...prev, size: e.target.value}))}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            disabled={!formData.category}
                                        >
                                            <option value="">
                                                {formData.category ? 'Select Size' : 'Select Category First'}
                                            </option>
                                            {getSizeOptions(formData.category).map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unit *
                                        </label>
                                        {formData.category && formData.category !== 'Others' ? (
                                            // Auto-selected unit for specific categories
                                            <input
                                                type="text"
                                                value={formData.unit}
                                                readOnly
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600"
                                                placeholder="Unit auto-selected based on category"
                                            />
                                        ) : (
                                            // Manual selection for Others category
                                            <select
                                                required
                                                value={formData.unit}
                                                onChange={(e) => setFormData(prev => ({...prev, unit: e.target.value}))}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                disabled={!formData.category}
                                            >
                                                <option value="">
                                                    {formData.category ? 'Select Unit' : 'Select Category First'}
                                                </option>
                                                {getUnitOptions(formData.category).map(unit => (
                                                    <option key={unit} value={unit}>{unit}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price ($) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={formData.price}
                                            onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Stock *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.currentStock}
                                            onChange={(e) => setFormData(prev => ({...prev, currentStock: e.target.value}))}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Safety Stock
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.safetyStock}
                                            onChange={(e) => setFormData(prev => ({...prev, safetyStock: e.target.value}))}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Reorder Level *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.reorderLevel}
                                            onChange={(e) => setFormData(prev => ({...prev, reorderLevel: e.target.value}))}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Image
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            {imagePreview ? (
                                                <div className="mx-auto">
                                                    <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {setImagePreview(null); setImageFile(null);}}
                                                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                                                    >
                                                        Remove Image
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <div className="flex text-sm text-gray-600">
                                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                                                            <span>Upload a file</span>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleImageSelect}
                                                                className="sr-only"
                                                            />
                                                        </label>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Raw Material Recipe */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Raw Material Recipe
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addRecipeItem}
                                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                                        >
                                            + Add Raw Material
                                        </button>
                                    </div>
                                    
                                    {formData.rawMaterialRecipe.map((recipe, index) => (
                                        <div key={index} className="grid grid-cols-4 gap-2 mb-2 items-end">
                                            <div>
                                                <select
                                                    value={recipe.type}
                                                    onChange={(e) => updateRecipeItem(index, 'type', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                >
                                                    <option value="">Select Material</option>
                                                    {rawMaterials.map(material => (
                                                        <option key={material._id} value={material.type}>
                                                            {material.type}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Qty per unit (kg)"
                                                    value={recipe.qtyPerUnitKg}
                                                    onChange={(e) => updateRecipeItem(index, 'qtyPerUnitKg', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Waste %"
                                                    value={recipe.wastePercentage}
                                                    onChange={(e) => updateRecipeItem(index, 'wastePercentage', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                />
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRecipeItem(index)}
                                                    className="text-red-600 hover:text-red-800 px-3 py-2"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                                    >
                                        {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Restock Modal */}
            {showRestockModal && restockingProduct && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Restock Product
                            </h3>
                            
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                    {error}
                                </div>
                            )}
                            
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900">{restockingProduct.productName}</h4>
                                <p className="text-sm text-gray-600">Current Stock: {restockingProduct.currentStock} {restockingProduct.unit}</p>
                            </div>
                            
                            <form onSubmit={submitRestock}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Add Stock Amount
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={restockAmount}
                                        onChange={(e) => setRestockAmount(e.target.value)}
                                        placeholder={`Enter amount in ${restockingProduct.unit}`}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRestockModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                                    >
                                        {loading ? 'Restocking...' : 'Restock'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;