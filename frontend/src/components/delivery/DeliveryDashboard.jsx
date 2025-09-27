import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import StatCards from '../Dashboard/StatCards';
import PieChart from '../Dashboard/PieChart';
import DriverManagement from './DriverManagement';
import OrdersView from './OrdersView';
import DeliveriesView from './DeliveriesView';
import { 
    deliverySidebarLinks, 
    deliveryUserInfo, 
    deliveryStatsData, 
    deliveryChartData,
    updateDeliveryStats,
    updateDeliveryCharts
} from '../../data/deliveryData';

const DeliveryDashboard = () => {
    const [stats, setStats] = useState(deliveryStatsData);
    const [charts, setCharts] = useState(deliveryChartData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch all dashboard data in parallel
            const [driverResponse, orderResponse, taskResponse] = await Promise.all([
                fetch('/api/delivery/drivers/stats', { credentials: 'include' }).catch(() => null),
                fetch('/api/delivery/orders', { credentials: 'include' }).catch(() => null),
                fetch('/api/delivery/tasks/stats', { credentials: 'include' }).catch(() => null)
            ]);

            const realData = {
                drivers: { total: 0, available: 0, busy: 0, assigned: 0 },
                orders: { total: 0, farmerOrders: 0, customerOrders: 0 },
                deliveryTasks: { pending: 0, assigned: 0, delivered: 0 }
            };

            // Process driver data
            if (driverResponse && driverResponse.ok) {
                const driverData = await driverResponse.json();
                if (driverData.data) {
                    realData.drivers = driverData.data;
                }
            }

            // Process order data
            if (orderResponse && orderResponse.ok) {
                const orderData = await orderResponse.json();
                if (orderData.data) {
                    const orders = orderData.data.orders || [];
                    realData.orders = {
                        total: orders.length
                    };
                }
            }

            // Process task data
            if (taskResponse && taskResponse.ok) {
                const taskData = await taskResponse.json();
                if (taskData.data) {
                    realData.deliveryTasks = taskData.data;
                }
            }

            // Update stats and charts with real data
            setStats(updateDeliveryStats(deliveryStatsData, realData));
            setCharts(updateDeliveryCharts(deliveryChartData, realData));

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
                            <h2 className="text-2xl font-bold text-gray-900">Delivery Dashboard Overview</h2>
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

            case 'drivers':
                return (
                    <div className="space-y-6">
                        <DriverManagement onStatsUpdate={fetchDashboardData} />
                    </div>
                );

            case 'orders':
                return (
                    <div className="space-y-6">
                        <OrdersView onStatsUpdate={fetchDashboardData} />
                    </div>
                );

            case 'deliveries':
                return (
                    <div className="space-y-6">
                        <DeliveriesView onStatsUpdate={fetchDashboardData} />
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
            sidebarLinks={deliverySidebarLinks}
            userInfo={deliveryUserInfo}
            headerTitle="Delivery Management"
        >
            {renderDashboardContent}
        </DashboardLayout>
    );
};

export default DeliveryDashboard;