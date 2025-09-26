import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import StatCards from '../Dashboard/StatCards';
import PieChart from '../Dashboard/PieChart';
import RawMaterialManagement from './RawMaterialManagement';
import MaterialOrders from './MaterialOrders';
import ProductManagement from './ProductManagement';
import { 
    inventorySidebarLinks, 
    inventoryUserInfo, 
    inventoryStatsData, 
    inventoryChartData,
    updateInventoryStats,
    updateInventoryCharts
} from '../../data/inventoryData';

const InventoryDashboard = () => {
    const [stats, setStats] = useState(inventoryStatsData);
    const [charts, setCharts] = useState(inventoryChartData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch inventory-related data in parallel
            const [rawMaterialsResponse, productsResponse, ordersResponse] = await Promise.all([
                fetch('/api/raw-materials', { credentials: 'include' }).catch(() => null),
                fetch('/api/products', { credentials: 'include' }).catch(() => null),
                fetch('/api/rm-orders', { credentials: 'include' }).catch(() => null)
            ]);

            const realData = {
                rawMaterials: { total: 45, subtitle: 'Green & Black Pepper' },
                products: { total: 28, subtitle: 'Ready for sale' },
                lowStock: { count: 8, subtitle: 'Require restocking' },
                pendingOrders: { count: 12, subtitle: 'Raw material orders' },
                rawMaterialDistribution: [65, 35],
                productStockStatus: [45, 30, 15, 10]
            };

            // Process raw materials data
            if (rawMaterialsResponse && rawMaterialsResponse.ok) {
                const rawMaterialsData = await rawMaterialsResponse.json();
                if (rawMaterialsData.data) {
                    const materials = rawMaterialsData.data;
                    realData.rawMaterials = {
                        total: materials.length,
                        subtitle: 'Active materials'
                    };
                    
                    // Calculate distribution
                    const greenPepper = materials.filter(m => m.type === 'Green Pepper').length;
                    const blackPepper = materials.filter(m => m.type === 'Black Pepper').length;
                    realData.rawMaterialDistribution = [greenPepper, blackPepper];
                }
            }

            // Process products data
            if (productsResponse && productsResponse.ok) {
                const productsData = await productsResponse.json();
                if (productsData.data) {
                    const products = productsData.data;
                    realData.products = {
                        total: products.length,
                        subtitle: 'Total products'
                    };
                    
                    // Calculate stock status
                    const inStock = products.filter(p => p.stockStatus === 'InStock').length;
                    const lowStock = products.filter(p => p.stockStatus === 'LowStock').length;
                    
                    realData.productStockStatus = [inStock, lowStock];
                    realData.lowStock = {
                        count: lowStock,
                        subtitle: 'Need attention'
                    };
                }
            }

            // Process orders data
            if (ordersResponse && ordersResponse.ok) {
                const ordersData = await ordersResponse.json();
                if (ordersData.data) {
                    const pendingOrders = ordersData.data.filter(order => order.status === 'Pending');
                    realData.pendingOrders = {
                        count: pendingOrders.length,
                        subtitle: 'Awaiting delivery'
                    };
                }
            }

            // Update stats and charts with real data
            setStats(updateInventoryStats(inventoryStatsData, realData));
            setCharts(updateInventoryCharts(inventoryChartData, realData));

        } catch (error) {
            console.error('Error fetching inventory dashboard data:', error);
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
                            <h2 className="text-2xl font-bold text-gray-900">Inventory Overview</h2>
                            <button
                                onClick={fetchDashboardData}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
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
                                    labels={chart.labels}
                                    backgroundColor={chart.backgroundColor}
                                />
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-700">Add Raw Material</p>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-700">Create Product</p>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-700">Place Order</p>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 012 2v6.5a.5.5 0 001 0V5a2 2 0 012-2v1a2 2 0 012 2v3.5a.5.5 0 001 0V5a2 2 0 012-2v1a2 2 0 012 2v4.5a.5.5 0 001 0V5a2 2 0 00-2-2V3a2 2 0 00-2-2H6a2 2 0 00-2 2v2z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-700">View History</p>
                            </div>
                        </div>
                    </div>
                );

            case 'raw-materials':
                return <RawMaterialManagement />;

            case 'products':
                return <ProductManagement />;

            case 'material-orders':
                return <MaterialOrders />;

            case 'inventory-history':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Inventory History</h2>
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 012 2v6.5a.5.5 0 001 0V5a2 2 0 012-2v1a2 2 0 012 2v3.5a.5.5 0 001 0V5a2 2 0 012-2v1a2 2 0 012 2v4.5a.5.5 0 001 0V5a2 2 0 00-2-2V3a2 2 0 00-2-2H6a2 2 0 00-2 2v2z" clipRule="evenodd"/>
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Inventory History</h3>
                            <p className="text-gray-400">Track all inventory movements and changes</p>
                            <div className="mt-4 text-sm text-gray-500">
                                • Movement History • Stock Changes • Audit Trail • Reports
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h2>
                        <div className="text-center py-12">
                            <p className="text-gray-500">Select a section from the sidebar</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <DashboardLayout
            sidebarLinks={inventorySidebarLinks}
            userInfo={inventoryUserInfo}
            headerTitle="Inventory Dashboard"
        >
            {renderDashboardContent}
        </DashboardLayout>
    );
};

export default InventoryDashboard;