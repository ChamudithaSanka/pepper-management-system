import React, { useState, useEffect } from 'react';

const CustomerIncome = () => {
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
        const totalIncome = paymentsData
            .filter(p => p.paymentStatus === 'Completed')
            .reduce((sum, payment) => sum + payment.amount, 0);

        setStatistics({
            totalIncome,
            totalPayments,
            completedPayments,
            pendingPayments
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
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
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Customer Income</h2>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="">All Payments</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                </select>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Total Income</h3>
                        <div className="h-4 w-4 text-green-600">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(statistics.totalIncome)}
                        </div>
                        <p className="text-xs text-gray-500">
                            From completed payments
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Total Payments</h3>
                        <div className="h-4 w-4 text-blue-600">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">
                            {statistics.totalPayments}
                        </div>
                        <p className="text-xs text-gray-500">
                            All payment records
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Completed</h3>
                        <div className="h-4 w-4 text-green-600">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                      d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-600">
                            {statistics.completedPayments}
                        </div>
                        <p className="text-xs text-gray-500">
                            Successfully processed
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Pending</h3>
                        <div className="h-4 w-4 text-yellow-600">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {statistics.pendingPayments}
                        </div>
                        <p className="text-xs text-gray-500">
                            Awaiting processing
                        </p>
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Recent Customer Payments</h3>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2 font-medium">Payment ID</th>
                                    <th className="text-left p-2 font-medium">Customer</th>
                                    <th className="text-left p-2 font-medium">Amount</th>
                                    <th className="text-left p-2 font-medium">Method</th>
                                    <th className="text-left p-2 font-medium">Status</th>
                                    <th className="text-left p-2 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length > 0 ? payments.map((payment) => (
                                    <tr key={payment._id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 text-sm font-mono">
                                            {payment.paymentId}
                                        </td>
                                        <td className="p-2">
                                            <div>
                                                <div className="font-medium">
                                                    {payment.customerId?.name || `Customer ID: ${payment.customerId || 'N/A'}`}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {payment.customerId?.email || 'No email available'}
                                                </div>
                                                {!payment.customerId?.name && (
                                                    <div className="text-xs text-red-500">
                                                        Customer record missing
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-2 font-medium">
                                            {formatCurrency(payment.amount)}
                                        </td>
                                        <td className="p-2">
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                {payment.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusBadgeColor(payment.paymentStatus)}`}>
                                                {payment.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="p-2 text-sm text-gray-600">
                                            {payment.paymentDate ? formatDate(payment.paymentDate) : formatDate(payment.createdAt)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-500">
                                            No payments found
                                        </td>
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

export default CustomerIncome;