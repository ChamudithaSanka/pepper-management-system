import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [customer, setCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryAddress: {
      street: '',
      city: '',
      zipCode: '',
      fullAddress: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomerProfile();
  }, []);

  const fetchCustomerProfile = async () => {
    try {
      // Get customer session
      const sessionResponse = await fetch('/api/customers/session', {
        credentials: 'include'
      });
      const sessionData = await sessionResponse.json();

      if (!sessionData.success || !sessionData.isLoggedIn) {
        setLoading(false);
        return;
      }

      const customerId = sessionData.customer.customerId;

      // Fetch customer profile
      const profileResponse = await fetch(`/api/customers/profile/${customerId}`, {
        credentials: 'include'
      });
      const profileData = await profileResponse.json();

      if (profileData.success) {
        setCustomer(profileData.data);
        setFormData({
          name: profileData.data.name,
          email: profileData.data.email,
          phone: profileData.data.phone,
          deliveryAddress: profileData.data.deliveryAddress
        });
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('deliveryAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        deliveryAddress: {
          ...prev.deliveryAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/customers/profile/${customer.customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setCustomer(data.data);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Error updating profile: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      deliveryAddress: customer.deliveryAddress
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Unable to load profile</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
              <div className="bg-gray-100 px-3 py-2 rounded-lg text-gray-600">
                {customer.customerId}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              ) : (
                <div className="px-3 py-2 text-gray-900">{customer.name}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              ) : (
                <div className="px-3 py-2 text-gray-900">{customer.email}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              ) : (
                <div className="px-3 py-2 text-gray-900">{customer.phone}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
              <div className="px-3 py-2 text-gray-600">
                {new Date(customer.registrationDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="deliveryAddress.street"
                  value={formData.deliveryAddress.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              ) : (
                <div className="px-3 py-2 text-gray-900">{customer.deliveryAddress.street}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              {isEditing ? (
                <input
                  type="text"
                  name="deliveryAddress.city"
                  value={formData.deliveryAddress.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              ) : (
                <div className="px-3 py-2 text-gray-900">{customer.deliveryAddress.city}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
              {isEditing ? (
                <input
                  type="text"
                  name="deliveryAddress.zipCode"
                  value={formData.deliveryAddress.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              ) : (
                <div className="px-3 py-2 text-gray-900">{customer.deliveryAddress.zipCode}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
              {isEditing ? (
                <textarea
                  name="deliveryAddress.fullAddress"
                  value={formData.deliveryAddress.fullAddress}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              ) : (
                <div className="px-3 py-2 text-gray-900">{customer.deliveryAddress.fullAddress}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{customer.totalOrders}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {customer.status === 'Active' ? '✅' : '❌'}
            </div>
            <div className="text-sm text-gray-600">Account Status: {customer.status}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {customer.lastOrderDate 
                ? new Date(customer.lastOrderDate).toLocaleDateString()
                : 'N/A'
              }
            </div>
            <div className="text-sm text-gray-600">Last Order</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
