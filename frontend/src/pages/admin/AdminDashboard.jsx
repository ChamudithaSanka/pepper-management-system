import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import StatCards from '../../components/Dashboard/StatCards';
import PieChart from '../../components/Dashboard/PieChart';
import UserManagement from '../../components/admin/UserManagement';
import EmployeeManagement from '../../components/admin/EmployeeManagement';
import { 
    adminSidebarLinks, 
    adminUserInfo, 
    adminStatsData, 
    adminChartData,
    updateAdminStats,
    updateAdminCharts
} from '../../data/adminData';

const AdminDashboard = () => {
    const [stats, setStats] = useState(adminStatsData);
    const [charts, setCharts] = useState(adminChartData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch all dashboard data in parallel
            const [farmerResponse, userResponse, customerResponse] = await Promise.all([
                fetch('/api/farmers/stats', { credentials: 'include' }).catch(() => null),
                fetch('/api/users/stats', { credentials: 'include' }).catch(() => null),
                fetch('/api/customers', { credentials: 'include' }).catch(() => null)
            ]);

            const realData = {
                users: { total: 0, active: 0 },
                farmers: { total: 0, active: 0 },
                customers: { total: 0, active: 0 },
                orders: { total: 0, subtitle: 'This month' },
                revenue: { total: 'LKR 0', subtitle: 'This month' },
                userRoles: [1, 0, 0, 0], // Admin, Finance, Inventory, Delivery
                farmerStatus: [0, 0, 0] // Active, Inactive, Pending
            };

            // Process farmer data
            if (farmerResponse && farmerResponse.ok) {
                const farmerData = await farmerResponse.json();
                if (farmerData.data) {
                    realData.farmers = farmerData.data;
                    realData.farmerStatus = [
                        farmerData.data.active || 0,
                        farmerData.data.inactive || 0,
                        farmerData.data.pending || 0
                    ];
                }
            }

            // Process user data
            if (userResponse && userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.data) {
                    realData.users = userData.data;
                    realData.userRoles = userData.data.roleDistribution || [1, 0, 0, 0];
                }
            }

            // Process customer data
            if (customerResponse && customerResponse.ok) {
                const customerData = await customerResponse.json();
                if (customerData.data) {
                    const customers = customerData.data;
                    realData.customers = {
                        total: customers.length,
                        active: customers.filter(c => c.status === 'Active').length
                    };
                }
            }

            // Update stats and charts with real data
            setStats(updateAdminStats(adminStatsData, realData));
            setCharts(updateAdminCharts(adminChartData, realData));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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
                            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
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

            case 'users':
                return (
                    <div className="space-y-6">
                        <UserManagement onStatsUpdate={fetchDashboardData} />
                    </div>
                );

            case 'farmers':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Farmer Management</h2>
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Farmer Management</h3>
                            <p className="text-gray-400">Farmer management features will be implemented here</p>
                        </div>
                    </div>
                );

            case 'customers':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Customer Management</h3>
                            <p className="text-gray-400">Customer management features will be implemented here</p>
                        </div>
                    </div>
                );

            case 'employees':
                return (
                    <div className="space-y-6">
                        <EmployeeManagement onStatsUpdate={fetchDashboardData} />
                    </div>
                );

            case 'orders':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Order Management</h3>
                            <p className="text-gray-400">Order management features will be implemented here</p>
                        </div>
                    </div>
                );

            case 'inventory':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Inventory Overview</h2>
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Inventory Overview</h3>
                            <p className="text-gray-400">Inventory overview features will be implemented here</p>
                        </div>
                    </div>
                );

            case 'finance':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Financial Reports</h2>
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd"/>
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Financial Reports</h3>
                            <p className="text-gray-400">Financial reporting features will be implemented here</p>
                        </div>
                    </div>
                );

            case 'reports':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Analytics</h3>
                            <p className="text-gray-400">Analytics and reporting features will be implemented here</p>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                        <div className="text-center py-12">
                            <p className="text-gray-500">Select a section from the sidebar</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <DashboardLayout
            sidebarLinks={adminSidebarLinks}
            userInfo={adminUserInfo}
            headerTitle="Admin Dashboard"
        >
            {renderDashboardContent}
        </DashboardLayout>
    );
};

export default AdminDashboard;
