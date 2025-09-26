import React, { useState, useEffect } from 'react';

const PaymentMethods = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardholderName: '',
    cardType: 'Visa',
    lastFourDigits: '',
    expiryMonth: '',
    expiryYear: ''
  });

  useEffect(() => {
    fetchPaymentHistory();
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

  const handleAddPaymentMethod = (e) => {
    e.preventDefault();
    // In a real application, this would integrate with a payment processor
    alert('Payment method functionality would be integrated with a secure payment processor like Stripe or PayPal');
    setShowAddForm(false);
    setNewPaymentMethod({
      cardholderName: '',
      cardType: 'Visa',
      lastFourDigits: '',
      expiryMonth: '',
      expiryYear: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPaymentMethod(prev => ({
      ...prev,
      [name]: value
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

  const paymentMethods = Object.values(uniquePaymentMethods);

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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last 4 Digits
                </label>
                <input
                  type="text"
                  name="lastFourDigits"
                  value={newPaymentMethod.lastFourDigits}
                  onChange={handleInputChange}
                  required
                  maxLength="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="1234"
                />
              </div>
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
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
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
                  <option value="">Year</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() + i}>
                      {new Date().getFullYear() + i}
                    </option>
                  ))}
                </select>
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

      {/* Payment History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Payment ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.paymentId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{payment.paymentId}</td>
                    <td className="py-3 px-4 text-gray-600">{payment.orderId}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      LKR {payment.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {payment.paymentMethod}
                      {payment.cardDetails?.lastFourDigits && (
                        <span className="text-xs text-gray-500 block">
                          **** {payment.cardDetails.lastFourDigits}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(payment.paymentStatus)}`}>
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {payment.paymentDate 
                        ? new Date(payment.paymentDate).toLocaleDateString()
                        : new Date(payment.createdAt).toLocaleDateString()
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-gray-500">No payment history</div>
            <p className="text-sm text-gray-400 mt-1">
              Your payment transactions will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethods;
