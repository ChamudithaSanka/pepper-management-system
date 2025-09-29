import React, { useState, useEffect } from 'react';
import { generateOrderConfirmationPDF } from '../../utils/generateReceipt';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
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

      // Fetch customer orders
      const ordersResponse = await fetch(`/api/orders/customer/${customerId}`, {
        credentials: 'include'
      });
      const ordersData = await ordersResponse.json();

      if (ordersData.success && ordersData.data && Array.isArray(ordersData.data.orders)) {
        setOrders(ordersData.data.orders);
      } else {
        console.log('No orders data or invalid format:', ordersData);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Processing':
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const handleGeneratePDF = async (order) => {
    try {
      await generateOrderConfirmationPDF(order);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['Pending', 'Confirmed', 'Processing', 'Shipped'].includes(order.orderStatus);
    if (filter === 'delivered') return order.orderStatus === 'Delivered';
    if (filter === 'cancelled') return order.orderStatus === 'Cancelled';
    return true;
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
        
        {/* Filter Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded font-medium ${
              filter === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-green-100'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded font-medium ${
              filter === 'pending'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded font-medium ${
              filter === 'delivered'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
            }`}
          >
            Delivered
          </button>
        </div>
      </div>
      {filteredOrders.length > 0 ? (
        <div className="bg-white rounded-lg shadow border overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-sm font-semibold text-gray-800">Order ID</th>
                <th className="px-2 py-2 text-left text-sm font-semibold text-gray-800">Items</th>
                <th className="px-2 py-2 text-right text-sm font-semibold text-gray-800">Amount</th>
                <th className="px-2 py-2 text-left text-sm font-semibold text-gray-800">Status</th>
                <th className="px-2 py-2 text-left text-sm font-semibold text-gray-800">Payment</th>
                <th className="px-2 py-2 text-left text-sm font-semibold text-gray-800">Created</th>
                <th className="px-2 py-2 text-left text-sm font-semibold text-gray-800">Est. Delivery</th>
                <th className="px-2 py-2 text-center text-sm font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredOrders.map((order, idx) => (
                <tr key={order.orderId} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                  <td className="px-2 py-2 text-sm font-mono text-green-700 font-semibold">#{order.orderId}</td>
                  <td className="px-2 py-2 text-sm text-gray-800">
                    {order.items?.map((it, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded mb-1 border">
                        <div className="text-sm font-medium text-gray-800">{it.productName} x{it.quantity}</div>
                        <div className="text-sm text-green-700 font-semibold">LKR {it.subtotal.toFixed(2)}</div>
                      </div>
                    ))}
                  </td>
                  <td className="px-2 py-2 text-sm font-bold text-right text-green-700">LKR {order.totalAmount.toFixed(2)}</td>
                  <td className="px-2 py-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' : order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-2 py-2 text-sm text-gray-600">{order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-2 py-2 text-center text-sm font-medium">
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => handleGeneratePDF(order)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border shadow">
          <div className="text-gray-500 text-lg mb-2">
            {filter === 'all' ? 'No orders found' : `No ${filter} orders found`}
          </div>
          <p className="text-gray-400 text-sm">
            {filter === 'all' 
              ? 'Start shopping to see your orders here!'
              : `You don't have any ${filter} orders at the moment.`
            }
          </p>
          {filter === 'all' && (
            <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium">
              Start Shopping
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
