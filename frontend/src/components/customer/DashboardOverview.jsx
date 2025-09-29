import React, { useState, useEffect } from 'react';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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
        const orders = ordersData.data.orders;
        
        // Calculate stats
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => 
          ['Pending', 'Confirmed', 'Processing', 'Shipped'].includes(order.orderStatus)
        ).length;
        const deliveredOrders = orders.filter(order => order.orderStatus === 'Delivered').length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        setStats({
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalSpent
        });

        // Get recent orders (last 5)
        setRecentOrders(orders.slice(0, 5));
      } else {
        console.log('No orders data or invalid format:', ordersData);
        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          deliveredOrders: 0,
          totalSpent: 0
        });
        setRecentOrders([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        totalSpent: 0
      });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Pending Orders</p>
              <p className="text-2xl font-bold text-orange-900">{stats.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Delivered Orders</p>
              <p className="text-2xl font-bold text-green-900">{stats.deliveredOrders}</p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Spent</p>
              <p className="text-2xl font-bold text-purple-900">LKR {stats.totalSpent.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h3>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.orderId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{order.orderId}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.orderStatus === 'Delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      LKR {order.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No orders found</p>
            <p className="text-sm">Start shopping to see your orders here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
