import React, { useState, useEffect } from 'react';

const PaymentMethods = () => {
  const [payments, setPayments] = useState([]);
  const [savedMethods, setSavedMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardholderName: '',
    cardType: 'Visa',
    lastFourDigits: '',
    expiryMonth: '',
    expiryYear: '',
    cardNumber: '',
    cvv: ''
  });

  useEffect(() => {
    fetchPaymentHistory();
    fetchSavedPaymentMethods();
  }, []);

  const fetchPaymentHistory = async () => {
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

      // Fetch customer payments
      const paymentsResponse = await fetch(`/api/payments/customer/${customerId}`, {
        credentials: 'include'
      });
      const paymentsData = await paymentsResponse.json();

      if (paymentsData.success && Array.isArray(paymentsData.data)) {
        setPayments(paymentsData.data);
      } else {
        console.log('No payments data or invalid format:', paymentsData);
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPaymentMethods = async () => {
    try {
      const sessionResponse = await fetch('/api/customers/session', {
        credentials: 'include'
      });
      const sessionData = await sessionResponse.json();

      if (!sessionData.success || !sessionData.isLoggedIn) {
        setSavedMethods([]);
        return;
      }

      const customerId = sessionData.customer.customerId;

      const methodsResponse = await fetch(`/api/paymentMethods/${customerId}`, {
        credentials: 'include'
      });
      const methodsData = await methodsResponse.json();

      if (methodsData.success && Array.isArray(methodsData.data)) {
        setSavedMethods(methodsData.data);
      } else {
        setSavedMethods([]);
      }
    } catch (error) {
      console.error('Error fetching saved payment methods:', error);
      setSavedMethods([]);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Refunded':
        return 'bg-purple-100 text-purple-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getCardIcon = (cardType) => {
    switch (cardType) {
      case 'Visa':
        return '💳';
      case 'MasterCard':
        return '💳';
      case 'American Express':
        return '💳';
      default:
        return '💳';
    }
  };

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();

    try {
      // Get customer session
      const sessionResponse = await fetch('/api/customers/session', {
        credentials: 'include'
      });
      const sessionData = await sessionResponse.json();

      if (!sessionData.success || !sessionData.isLoggedIn) {
        alert('Please log in to add payment methods');
        return;
      }

      const customerId = sessionData.customer.customerId;

      // Add payment method
      const response = await fetch(`/api/paymentMethods/${customerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          cardholderName: newPaymentMethod.cardholderName,
          cardType: newPaymentMethod.cardType,
          cardNumber: newPaymentMethod.cardNumber,
          expiryMonth: newPaymentMethod.expiryMonth,
          expiryYear: newPaymentMethod.expiryYear,
          cvv: newPaymentMethod.cvv,
          isDefault: payments.length === 0 // Set as default if first payment method
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Payment method added successfully!');
        setShowAddForm(false);
        setNewPaymentMethod({
          cardholderName: '',
          cardType: 'Visa',
          lastFourDigits: '',
          expiryMonth: '',
          expiryYear: '',
          cardNumber: '',
          cvv: ''
        });
        fetchSavedPaymentMethods();
      } else {
        alert('Error adding payment method: ' + data.message);
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      alert('Error adding payment method');
    }
  };

  // Validation functions
  const validateCardholderName = (value) => {
    // Only allow letters, spaces, hyphens, and apostrophes
    return value.replace(/[^a-zA-Z\s\-']/g, '');
  };

  const validateCardNumber = (value) => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 16 digits
    const limitedDigits = digitsOnly.slice(0, 16);
    
    // Format with spaces every 4 digits
    return limitedDigits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const validateCVV = (value) => {
    // Only allow digits, limit to 4 characters
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const validateExpiryMonth = (value) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    
    // Convert to number and validate range
    const month = parseInt(digitsOnly);
    if (month >= 1 && month <= 12) {
      return digitsOnly;
    } else if (digitsOnly.length < 2) {
      return digitsOnly;
    }
    
    // If invalid, return previous valid value
    return newPaymentMethod.expiryMonth;
  };

  const validateExpiryYear = (value) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 4 digits
    const limitedDigits = digitsOnly.slice(0, 4);
    
    // Check if it's a valid future year (current year onwards)
    const currentYear = new Date().getFullYear();
    const year = parseInt(limitedDigits);
    
    if (limitedDigits.length < 4) {
      return limitedDigits;
    }
    
    if (year >= currentYear && year <= currentYear + 20) {
      return limitedDigits;
    }
    
    // If invalid, return previous valid value
    return newPaymentMethod.expiryYear;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let validatedValue = value;

    // Apply validation based on field type
    switch (name) {
      case 'cardholderName':
        validatedValue = validateCardholderName(value);
        break;
      case 'cardNumber':
        validatedValue = validateCardNumber(value);
        break;
      case 'cvv':
        validatedValue = validateCVV(value);
        break;
      case 'expiryMonth':
        validatedValue = validateExpiryMonth(value);
        break;
      case 'expiryYear':
        validatedValue = validateExpiryYear(value);
        break;
      default:
        validatedValue = value;
    }

    setNewPaymentMethod(prev => ({
      ...prev,
      [name]: validatedValue
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading payment information...</div>
      </div>
    );
  }

  // Get unique payment methods from payment history
  const uniquePaymentMethods = Array.isArray(payments) ? payments.reduce((acc, payment) => {
    if (payment.cardDetails && payment.cardDetails.lastFourDigits) {
      const key = `${payment.cardDetails.cardType}-${payment.cardDetails.lastFourDigits}`;
      if (!acc[key]) {
        acc[key] = {
          cardType: payment.cardDetails.cardType,
          lastFourDigits: payment.cardDetails.lastFourDigits,
          cardholderName: payment.cardDetails.cardholderName,
          expiryMonth: payment.cardDetails.expiryMonth,
          expiryYear: payment.cardDetails.expiryYear,
          lastUsed: payment.paymentDate
        };
      }
    }
    return acc;
  }, {}) : {};

  // Prefer saved methods; fallback to deriving from payment history
  const paymentMethods = savedMethods.length > 0
    ? savedMethods.map(m => ({
        cardType: m.cardType,
        lastFourDigits: m.lastFourDigits,
        cardholderName: m.cardholderName,
        expiryMonth: m.expiryMonth,
        expiryYear: m.expiryYear,
        lastUsed: null,
        paymentMethodId: m.paymentMethodId,
        isDefault: m.isDefault
      }))
    : Object.values(uniquePaymentMethods);
  const currentYear = new Date().getFullYear();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Payment Method'}
        </button>
      </div>

      {/* Add Payment Method Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Payment Method</h3>
          <form onSubmit={handleAddPaymentMethod} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={newPaymentMethod.cardholderName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Type
                </label>
                <select
                  name="cardType"
                  value={newPaymentMethod.cardType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="Visa">Visa</option>
                  <option value="MasterCard">MasterCard</option>
                  <option value="American Express">American Express</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number (Full)
              </label>
              <input
                type="text"
                name="cardNumber"
                value={newPaymentMethod.cardNumber}
                onChange={handleInputChange}
                required
                maxLength="19"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Month
                </label>
                <select
                  name="expiryMonth"
                  value={newPaymentMethod.expiryMonth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Year
                </label>
                <select
                  name="expiryYear"
                  value={newPaymentMethod.expiryYear}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="">YYYY</option>
                  {Array.from({ length: 21 }, (_, i) => String(currentYear + i)).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={newPaymentMethod.cvv}
                  onChange={handleInputChange}
                  required
                  maxLength="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="123"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Payment Method
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Saved Payment Methods */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Payment Methods</h3>
        {paymentMethods.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCardIcon(method.cardType)}</span>
                    <span className="font-medium text-gray-900">{method.cardType}</span>
                  </div>
                  <button className="text-red-500 hover:text-red-700 text-sm">
                    Remove
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  <div>**** **** **** {method.lastFourDigits}</div>
                  <div>{method.cardholderName}</div>
                  <div>Expires: {method.expiryMonth}/{method.expiryYear}</div>
                  {method.lastUsed && (
                    <div className="text-xs text-gray-500 mt-1">
                      Last used: {new Date(method.lastUsed).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-gray-500">No saved payment methods</div>
            <p className="text-sm text-gray-400 mt-1">
              Add a payment method to make checkout faster
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethods;
