import React, { useState, useEffect } from 'react';

const MarketplaceIncome = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState({
        totalIncome: 0,
        totalPayments: 0,
        completedPayments: 0,
        pendingPayments: 0
    });
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchPayments();
    }, [statusFilter]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            
            // Build query parameters
            const queryParams = new URLSearchParams({
                limit: '50' // Get more payments for better overview
            });
            
            if (statusFilter) {
                queryParams.append('status', statusFilter);
            }

            const response = await fetch(`/api/payments?${queryParams.toString()}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Customer payments data:', result.data.payments);
                setPayments(result.data.payments);
                
                // Calculate statistics
                calculateStatistics(result.data.payments);
            } else {
                console.error('Failed to fetch customer payments');
            }
        } catch (error) {
            console.error('Error fetching customer payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStatistics = (paymentsData) => {
        const totalPayments = paymentsData.length;
        const completedPayments = paymentsData.filter(p => p.paymentStatus === 'Completed').length;
        const pendingPayments = paymentsData.filter(p => p.paymentStatus === 'Pending').length;
        const totalIncome = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);

        setStatistics({
            totalIncome,
            totalPayments,
            completedPayments,
            pendingPayments
        });
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

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Failed':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 p-6 min-h-screen" style={{ background: 'linear-gradient(135deg, #b2f5ea 0%, #a7f3d0 100%)' }}>
                <div className="animate-pulse">
                    <div className="h-8 bg-green-100 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="h-24 bg-blue-100 rounded"></div>
                        ))}
                    </div>
                    <div className="h-64 bg-blue-50 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 min-h-screen" style={{ background: 'linear-gradient(135deg, #b2f5ea 0%, #a7f3d0 100%)' }}>
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">Marketplace Income</h2>
                <div className="bg-blue-50 rounded-lg shadow p-4">
                    <label className="text-sm font-medium text-gray-700 mr-2">Filter by Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-green-400 bg-green-50 text-green-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-500"
                    >
                        <option value="">All Payments</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
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
                            <p className="text-sm font-medium text-gray-600">Total Income</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(statistics.totalIncome)}</p>
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
                            <p className="text-sm font-medium text-gray-600">Payments</p>
                            <p className="text-2xl font-semibold text-gray-900">{statistics.totalPayments}</p>
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
                            <p className="text-2xl font-semibold text-gray-900">{statistics.pendingPayments}</p>
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
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-semibold text-gray-900">{statistics.completedPayments}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-blue-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Payment ID</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Customer Name</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Customer Email</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Customer ID</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Method</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length > 0 ? payments.map((payment, idx) => (
                                    <tr key={payment._id} className={idx % 2 === 0 ? "bg-green-50" : "bg-white hover:bg-green-100"}>
                                        <td className="px-2 py-2 text-sm font-mono text-gray-900">{payment.paymentId}</td>
                                        <td className="px-2 py-2 font-medium text-gray-900">{payment.customerId?.name || 'N/A'}</td>
                                        <td className="px-2 py-2 text-gray-500">{payment.customerId?.email || 'No email available'}</td>
                                        <td className="px-2 py-2 text-sm text-gray-900">{payment.customerId?.customerId || 'N/A'}</td>
                                        <td className="px-2 py-2 font-medium text-gray-900">{formatCurrency(payment.amount)}</td>
                                        <td className="px-2 py-2">
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{payment.paymentMethod}</span>
                                        </td>
                                        <td className="px-2 py-2">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payment.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : payment.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{payment.paymentStatus}</span>
                                        </td>
                                        <td className="px-2 py-2 text-sm text-gray-600">{payment.paymentDate ? formatDate(payment.paymentDate) : formatDate(payment.createdAt)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-gray-500">No payments found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceIncome;
