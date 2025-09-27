import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import StatCards from '../Dashboard/StatCards';
import PieChart from '../Dashboard/PieChart';
import RawMaterialManagement from './RawMaterialManagement';
import MaterialOrders from './MaterialOrders';
import ProductManagement from './ProductManagement';
import { 
    inventorySidebarLinks, 
    inventoryUserInfo
} from '../../data/inventoryData';

const InventoryDashboard = () => {
    const [stats, setStats] = useState([]);
    const [charts, setCharts] = useState([]);
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
                rawMaterials: { total: 0, subtitle: 'Active materials' },
                products: { total: 0, subtitle: 'Total products' },
                rawMaterialOrders: { total: 0, subtitle: 'All orders' },
                lowStock: { count: 0, subtitle: 'Need attention' },
                pendingOrders: { count: 0, subtitle: 'Awaiting delivery' },
                rawMaterialDistribution: [0, 0],
                productStockStatus: [0, 0, 0, 0]
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
                    const orders = ordersData.data;
                    const pendingOrders = orders.filter(order => order.status === 'Pending');
                    
                    realData.rawMaterialOrders = {
                        total: orders.length,
                        subtitle: 'All orders'
                    };
                    
                    realData.pendingOrders = {
                        count: pendingOrders.length,
                        subtitle: 'Awaiting delivery'
                    };
                }
            }

            // Build stats array with real data
            const newStats = [
                {
                    title: 'Total Products',
                    value: realData.products?.total || '0',
                    subtitle: realData.products?.subtitle || 'Total products',
                    icon: 'orders',
                    iconBgColor: 'bg-blue-100',
                    iconTextColor: 'text-blue-600',
                    valueColor: 'text-gray-900'
                },
                {
                    title: 'Total Raw Material Orders',
                    value: realData.rawMaterialOrders?.total || '0',
                    subtitle: realData.rawMaterialOrders?.subtitle || 'All orders',
                    icon: 'farmers',
                    iconBgColor: 'bg-green-100',
                    iconTextColor: 'text-green-600',
                    valueColor: 'text-gray-900'
                },
                {
                    title: 'Pending Orders',
                    value: realData.pendingOrders?.count || '0',
                    subtitle: realData.pendingOrders?.subtitle || 'Awaiting delivery',
                    icon: 'inventory',
                    iconBgColor: 'bg-yellow-100',
                    iconTextColor: 'text-yellow-600',
                    valueColor: 'text-gray-900'
                },
                {
                    title: 'Low Stock Products',
                    value: realData.lowStock?.count || '0',
                    subtitle: realData.lowStock?.subtitle || 'Need attention',
                    icon: 'users',
                    iconBgColor: 'bg-red-100',
                    iconTextColor: 'text-red-600',
                    valueColor: 'text-gray-900'
                }
            ];

            // Build charts array with real data
            const newCharts = [
                {
                    title: 'Raw Material Distribution',
                    data: {
                        labels: ['Green Pepper', 'Black Pepper'],
                        datasets: [{
                            data: realData.rawMaterialDistribution || [0, 0],
                            backgroundColor: ['#10B981', '#1F2937'],
                            borderColor: ['#047857', '#111827'],
                            borderWidth: 2
                        }]
                    }
                },
                {
                    title: 'Product Stock Status',
                    data: {
                        labels: ['In Stock', 'Low Stock', 'Out of Stock', 'Expiring Soon'],
                        datasets: [{
                            data: realData.productStockStatus || [0, 0, 0, 0],
                            backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#F97316'],
                            borderColor: ['#047857', '#D97706', '#DC2626', '#EA580C'],
                            borderWidth: 2
                        }]
                    }
                }
            ];

            setStats(newStats);
            setCharts(newCharts);

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
                                />
                            ))}
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