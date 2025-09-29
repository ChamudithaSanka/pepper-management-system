import React, { useState, useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';
import GoogleMapSelector from '../GoogleMapSelector';

// Static libraries array to prevent LoadScript reloading
const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry'];

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
      fullAddress: '',
      latitude: 6.9271,
      longitude: 79.8612
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Helper function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
  };

  // Helper function to validate name (letters, spaces, hyphens, apostrophes)
  const isValidName = (name) => {
    return /^[a-zA-Z\s\-']+$/.test(name);
  };

  // Helper function to validate phone number
  const isValidPhone = (phone) => {
    return /^[\d\s\-()+]*$/.test(phone);
  };

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
    let cleanValue = value;
    
    // Apply validation based on field type
    if (name === 'name') {
      // Name validation - only allow letters, spaces, hyphens, apostrophes
      // Allow spaces at the beginning, middle, and end for natural typing
      cleanValue = value.replace(/[^a-zA-Z\s\-']/g, '');
      
      // Prevent multiple consecutive spaces (but allow single spaces anywhere)
      cleanValue = cleanValue.replace(/\s{2,}/g, ' ');
      
    } else if (name === 'email') {
      // Email validation - only allow valid email characters and prevent invalid formats
      cleanValue = value.replace(/[^a-zA-Z0-9@._+-]/g, '');
      
      // Ensure there's only one @ symbol
      const atSymbolCount = (cleanValue.match(/@/g) || []).length;
      if (atSymbolCount > 1) {
        cleanValue = cleanValue.substring(0, cleanValue.lastIndexOf('@'));
        cleanValue = cleanValue.replace(/@/g, '');
        cleanValue += '@';
      }
      
      // Prevent double dots
      cleanValue = cleanValue.replace(/\.{2,}/g, '.');
      
      // Prevent @ at the beginning
      if (cleanValue.startsWith('@')) {
        cleanValue = '';
      }
      
      // Prevent multiple dots before @
      const atIndex = cleanValue.indexOf('@');
      if (atIndex !== -1) {
        const beforeAt = cleanValue.substring(0, atIndex);
        const afterAt = cleanValue.substring(atIndex);
        
        // Clean before @ symbol
        const cleanedBeforeAt = beforeAt.replace(/\.{2,}/g, '.');
        cleanValue = cleanedBeforeAt + afterAt;
      }
      
      // Removed overly restrictive "prevent dots at the very end" logic
      // Users should be able to type domains like "user@example.com"
      
      // Prevent multiple consecutive special characters
      cleanValue = cleanValue.replace(/[._+-]{2,}/g, '.');
      
    } else if (name === 'phone') {
      // Phone validation - only allow numbers and common phone formatting chars
      cleanValue = value.replace(/[^\d\s\-()+]/g, '');
      
      // Prevent multiple consecutive spaces
      cleanValue = cleanValue.replace(/\s{2,}/g, ' ');
      
      // Limit length (phone number should be 10 digits)
      if (cleanValue.length > 10) {
        cleanValue = cleanValue.substring(0, 10);
      }
      
    } else if (name.includes('deliveryAddress.street')) {
      // Street address validation - allow letters, numbers...spaces, common address chars
      cleanValue = value.replace(/[^a-zA-Z0-9\s\-.,#/]/g, '');
      
      // Prevent multiple consecutive spaces
      cleanValue = cleanValue.replace(/\s{2,}/g, ' ');
      
      // Limit length (200 chars as per model)
      if (cleanValue.length > 200) {
        cleanValue = cleanValue.substring(0, 200);
      }
      
    } else if (name.includes('deliveryAddress.city')) {
      // City validation - allow letters, spaces, hyphens
      cleanValue = value.replace(/[^a-zA-Z\s\-]/g, '');
      
      // Prevent multiple consecutive spaces
      cleanValue = cleanValue.replace(/\s{2,}/g, ' ');
      
      // Limit length (100 chars as per model)
      if (cleanValue.length > 100) {
        cleanValue = cleanValue.substring(0, 100);
      }
      
    } else if (name.includes('deliveryAddress.zipCode')) {
      // Zip code validation - only allow numbers for Sri Lankan postal codes
      cleanValue = value.replace(/[^0-9]/g, '');
      
      // Limit length (Sri Lankan postal codes are 5 digits)
      if (cleanValue.length > 5) {
        cleanValue = cleanValue.substring(0, 5);
      }
    }

    if (name.includes('deliveryAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        deliveryAddress: {
          ...prev.deliveryAddress,
          [field]: cleanValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: cleanValue
      }));
    }
  };

  const handleLocationSelect = (location) => {
    // Use structured address_components from Google
    const getComponent = (type) => {
      const comp = location.address_components?.find(c => c.types.includes(type));
      return comp ? comp.long_name : '';
    };

    let street = getComponent('route');
    let city = getComponent('locality');
    let zipCode = getComponent('postal_code');
    const fullAddress = location.address || location.formatted_address || '';

    // Fallback: if street/city missing, use parts of formatted address
    if (!street || !city) {
      const parts = fullAddress.split(',').map(p => p.trim());
      if (!street && parts.length > 0) street = parts[0];
      if (!city && parts.length > 1) city = parts[1];
    }

    // Default zipCode if not found
    if (!zipCode) {
      zipCode = '00000';
    }

    setFormData(prev => ({
      ...prev,
      deliveryAddress: {
        ...prev.deliveryAddress,
        latitude: location.latitude,
        longitude: location.longitude,
        street,
        city,
        zipCode,
        fullAddress
      }
    }));
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete your account?\n\nThis action cannot be undone and will permanently remove:\n• Your profile information\n• All associated data`
    );
    
    if (!confirmed) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/customers/profile/${customer.customerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        alert('Account deleted successfully. You will be redirected to the home page.');
        // Redirect to home page
        window.location.href = '/';
      } else {
        alert('Error deleting account: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account');
    } finally {
      setDeleting(false);
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
          <div className="space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
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
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  autoComplete="email"
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
                  autoComplete="tel"
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
                  autoComplete="street-address"
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
                  autoComplete="address-level2"
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
                  autoComplete="postal-code"
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
                  disabled
                />
              ) : (
                <div className="px-3 py-2 text-gray-900">{customer.deliveryAddress.fullAddress}</div>
              )}
            </div>

          </div>
        </div>
     
      </div>
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Location on Map</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <LoadScript
              key="profile-map-script"
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
              libraries={GOOGLE_MAPS_LIBRARIES}
            >
              <GoogleMapSelector
                onLocationSelect={handleLocationSelect}
                initialLocation={{
                  latitude: formData.deliveryAddress.latitude,
                  longitude: formData.deliveryAddress.longitude
                }}
                address={
                  [formData.deliveryAddress.street,
                   formData.deliveryAddress.city,
                   formData.deliveryAddress.zipCode,
                   formData.deliveryAddress.fullAddress]
                    .filter(Boolean)
                    .join(', ')
                }
              />
            </LoadScript>
          </div>
      </div>
</div>
  );
};

export default UserProfile;
