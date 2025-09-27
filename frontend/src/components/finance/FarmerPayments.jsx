import React, { useState, useEffect } from 'react';

const FarmerPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [stats, setStats] = useState({});

    useEffect(() => {
        fetchPayments();
        fetchStatistics();
    }, [statusFilter]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const url = statusFilter 
                ? `/api/farmer-payments?status=${statusFilter}`
                : '/api/farmer-payments';
                
            const response = await fetch(url, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch payments');

            const data = await response.json();
            setPayments(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await fetch('/api/farmer-payments/statistics', {
                credentials: 'include'
            });

            if (!response.ok) return;

            const data = await response.json();
            setStats(data.data || {});
        } catch (err) {
            console.error('Failed to fetch statistics:', err);
        }
    };

    const updatePaymentStatus = async (paymentId, status) => {
        try {
            const response = await fetch(`/api/farmer-payments/${paymentId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ paymentStatus: status })
            });

            if (!response.ok) throw new Error('Failed to update payment status');

            fetchPayments();
            fetchStatistics();
        } catch (err) {
            alert('Failed to update payment status: ' + err.message);
        }
    };

    const getStatusColor = (status) => {
        return status === 'Pending' 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
    <div className="space-y-6 p-6 min-h-screen" style={{ background: 'linear-gradient(135deg, #b2f5ea 0%, #a7f3d0 100%)' }}>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Farmer Payments</h1>
                <p className="text-gray-600 mt-1">Payments calculated from delivered orders</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Payments</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalPayments || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Paid</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.paidPayments || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.pendingPayments || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-100 border-l-4 border-purple-500 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100">
                            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Amount</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {formatCurrency(stats.totalAmount || 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-blue-50 rounded-lg shadow mb-6 p-6">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-green-400 bg-green-50 text-green-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-500"
                    >
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-blue-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Payment List</h2>
                    
                </div>
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading payments...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <svg className="h-12 w-12 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="mt-4 text-red-600">Error: {error}</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <p className="mt-4 text-gray-600">No payments found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Payment ID</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Farmer Name</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Farmer NIC</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Order ID</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Quantity (kg)</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment, idx) => (
                                    <tr key={payment.paymentId} className={idx % 2 === 0 ? "bg-green-50" : "bg-white hover:bg-green-100"}>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{payment.paymentId}</td>
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{payment.farmerId?.name || 'N/A'}</div>
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">{payment.farmerId?.nic || 'N/A'}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">{payment.rmOrderId}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">{payment.pepperType}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">{payment.deliveredQuantityKg}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(payment.totalAmount)}</td>
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.paymentStatus)}`}>
                                                {payment.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">{formatDate(payment.generatedDate)}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                                            {payment.paymentStatus === 'Pending' && (
                                                <button
                                                    onClick={() => updatePaymentStatus(payment.paymentId, 'Paid')}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Mark as Paid"
                                                >
                                                    ✅ Mark Paid
                                                </button>
                                            )}
                                            {payment.paymentStatus === 'Paid' && (
                                                <span className="text-green-600 text-sm">✅ Paid</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerPayments;