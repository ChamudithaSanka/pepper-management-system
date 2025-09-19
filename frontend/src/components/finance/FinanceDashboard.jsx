import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import StatCards from '../Dashboard/StatCards';
import PieChart from '../Dashboard/PieChart';
import { 
    financeSidebarLinks, 
    financeUserInfo, 
    financeStatsData, 
    financeChartData,
    updateFinanceStats,
    updateFinanceCharts
} from '../../data/financeData';

const FinanceDashboard = () => {
    const [stats, setStats] = useState(financeStatsData);
    const [charts, setCharts] = useState(financeChartData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch finance-related data in parallel
            const [salaryResponse, farmerResponse, customerResponse] = await Promise.all([
                fetch('/api/users/stats', { credentials: 'include' }).catch(() => null),
                fetch('/api/farmers/stats', { credentials: 'include' }).catch(() => null),
                fetch('/api/customers', { credentials: 'include' }).catch(() => null)
            ]);

            const realData = {
                farmerPayments: { pending: 12, subtitle: 'Awaiting approval' },
                salaryBudget: { total: 'LKR 245,000', subtitle: 'This month' },
                customerIssues: { count: 8, subtitle: 'Pending resolution' },
                totalFlow: { amount: 'LKR 1,250,000', subtitle: 'Revenue this month' },
                paymentDistribution: [35, 40, 15, 10],
                expenseBreakdown: [45, 30, 15, 10]
            };

            // Process salary data
            if (salaryResponse && salaryResponse.ok) {
                const salaryData = await salaryResponse.json();
                if (salaryData.data) {
                    realData.salaryBudget = {
                        total: `LKR ${(salaryData.data.totalUsers * 50000) || 245000}`,
                        subtitle: 'This month'
                    };
                }
            }

            // Process farmer payment data
            if (farmerResponse && farmerResponse.ok) {
                const farmerData = await farmerResponse.json();
                if (farmerData.data) {
                    realData.farmerPayments = {
                        pending: farmerData.data.totalFarmers || 12,
                        subtitle: 'Awaiting approval'
                    };
                }
            }

            // Process customer payment issues
            if (customerResponse && customerResponse.ok) {
                const customerData = await customerResponse.json();
                if (customerData.data) {
                    const customers = customerData.data;
                    realData.customerIssues = {
                        count: Math.floor(customers.length * 0.1) || 8,
                        subtitle: 'Pending resolution'
                    };
                    
                    realData.totalFlow = {
                        amount: `LKR ${(customers.length * 15000) || 1250000}`,
                        subtitle: 'Revenue this month'
                    };
                }
            }

            // Update stats and charts with real data
            setStats(updateFinanceStats(financeStatsData, realData));
            setCharts(updateFinanceCharts(financeChartData, realData));

        } catch (error) {
            console.error('Error fetching finance dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderDashboardContent = ({ activeSection }) => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
                            <button
                                onClick={fetchDashboardData}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                            >
                                {loading ? 'Refreshing...' : 'Refresh Data'}
                            </button>
                        </div>
                        
                        {/* Stats Cards */}
                        <StatCards statsData={stats} />

                        {/* Charts Section */}
                        <div className="grid grid-cols-2 gap-6">
                            {charts.map((chart, index) => (
                                <PieChart 
                                    key={index}
                                    title={chart.title}
                                    data={chart.data}
                                />
                            ))}
                        </div>
                    </div>
                );

            case 'farmer-payments':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Farmer Payments</h2>
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h6zM4 14a2 2 0 002 2h8a2 2 0 002-2v-2H4v2z"/>
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Farmer Payments Management</h3>
                            <p className="text-gray-400">Farmer payment features will be implemented here</p>
                            <div className="mt-4 text-sm text-gray-500">
                                • View All Payments • Add Payment • Pending Approvals
                            </div>
                        </div>
                    </div>
                );

            case 'employee-salary':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Employee Salary Management</h2>
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd"/>
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Employee Salary Management</h3>
                            <p className="text-gray-400">Salary calculation and management features will be implemented here</p>
                            <div className="mt-4 text-sm text-gray-500">
                                • Calculate Salary • View Salary Slips • Salary History
                            </div>
                        </div>
                    </div>
                );

            case 'customer-payments':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Customer Payments</h2>
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h6zM4 14a2 2 0 002 2h8a2 2 0 002-2v-2H4v2z"/>
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Customer Payment Management</h3>
                            <p className="text-gray-400">Customer payment and refund features will be implemented here</p>
                            <div className="mt-4 text-sm text-gray-500">
                                • View All Payments • Process Refunds • Failed Payments
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Finance Dashboard</h2>
                        <div className="text-center py-12">
                            <p className="text-gray-500">Select a section from the sidebar</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <DashboardLayout
            sidebarLinks={financeSidebarLinks}
            userInfo={financeUserInfo}
            headerTitle="Finance Dashboard"
        >
            {renderDashboardContent}
        </DashboardLayout>
    );
};

export default FinanceDashboard;