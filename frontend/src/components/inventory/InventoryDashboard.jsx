import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import StatCards from '../Dashboard/StatCards';
import PieChart from '../Dashboard/PieChart';
import RawMaterialManagement from './RawMaterialManagement';
import MaterialOrders from './MaterialOrders';
import ProductManagement from './ProductManagement';
import InventoryHistory from './InventoryHistory';
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
                productCategories: [0, 0, 0, 0]
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
                    
                    // Calculate product categories based on actual category names
                    const pepperPowder = products.filter(p => p.category === 'Pepper Powder').length;
                    const pepperWhole = products.filter(p => p.category === 'Pepper Whole').length;
                    const pepperSpray = products.filter(p => p.category === 'Pepper Spray').length;
                    const pepperSauce = products.filter(p => p.category === 'Pepper Sauce').length;
                    const pepperOil = products.filter(p => p.category === 'Pepper Oil').length;
                    const others = products.filter(p => p.category === 'Others').length;
                    
                    realData.productCategories = [pepperPowder, pepperWhole, pepperSpray, pepperSauce, pepperOil, others];
                    
                    // Calculate low stock
                    const lowStock = products.filter(p => p.stockStatus === 'LowStock').length;
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

            // Build stats array with real data - organized as requested
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
                    title: 'Low Stock Products',
                    value: realData.lowStock?.count || '0',
                    subtitle: realData.lowStock?.subtitle || 'Need attention',
                    icon: 'users',
                    iconBgColor: 'bg-red-100',
                    iconTextColor: 'text-red-600',
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
                    title: 'Pending Raw Material Orders',
                    value: realData.pendingOrders?.count || '0',
                    subtitle: realData.pendingOrders?.subtitle || 'Awaiting delivery',
                    icon: 'inventory',
                    iconBgColor: 'bg-yellow-100',
                    iconTextColor: 'text-yellow-600',
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
                    title: 'Product Categories',
                    data: {
                        labels: ['Pepper Powder', 'Pepper Whole', 'Pepper Spray', 'Pepper Sauce', 'Pepper Oil', 'Others'],
                        datasets: [{
                            data: realData.productCategories || [0, 0, 0, 0, 0, 0],
                            backgroundColor: [
                                '#10B981', // green-500 - Pepper Powder
                                '#3B82F6', // blue-500 - Pepper Whole
                                '#8B5CF6', // purple-500 - Pepper Spray
                                '#F59E0B', // yellow-500 - Pepper Sauce
                                '#EF4444', // red-500 - Pepper Oil
                                '#6B7280'  // gray-500 - Others
                            ],
                            borderColor: [
                                '#047857', // green-700
                                '#1D4ED8', // blue-700
                                '#7C3AED', // purple-700
                                '#D97706', // yellow-700
                                '#DC2626', // red-700
                                '#374151'  // gray-700
                            ],
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
                return <InventoryHistory />;

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