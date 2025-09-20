// Inventory Dashboard Configuration
export const inventorySidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'raw-materials', label: 'Raw Materials', icon: 'inventory' },
    { id: 'products', label: 'Products', icon: 'orders' },
    { id: 'material-orders', label: 'Material Orders', icon: 'farmers' },
    { id: 'inventory-history', label: 'Inventory History', icon: 'users' }
];

export const inventoryUserInfo = {
    name: 'Inventory Manager',
    role: 'Inventory',
    initial: 'I',
    brandName: 'Inventory Panel',
    brandSubtitle: 'Stock Management'
};

export const inventoryStatsData = [
    {
        title: 'Total Raw Materials',
        value: '45',
        subtitle: 'Green & Black Pepper',
        icon: 'inventory',
        iconBgColor: 'bg-blue-100',
        iconTextColor: 'text-blue-600',
        valueColor: 'text-gray-900',
        trend: {
            value: '+5',
            isUp: true,
            color: 'text-green-600'
        }
    },
    {
        title: 'Finished Products',
        value: '28',
        subtitle: 'Ready for sale',
        icon: 'orders',
        iconBgColor: 'bg-green-100',
        iconTextColor: 'text-green-600',
        valueColor: 'text-gray-900',
        trend: {
            value: '+12',
            isUp: true,
            color: 'text-green-600'
        }
    },
    {
        title: 'Low Stock Items',
        value: '8',
        subtitle: 'Require restocking',
        icon: 'users',
        iconBgColor: 'bg-red-100',
        iconTextColor: 'text-red-600',
        valueColor: 'text-gray-900',
        trend: {
            value: '-3',
            isUp: false,
            color: 'text-red-600'
        }
    },
    {
        title: 'Pending Orders',
        value: '12',
        subtitle: 'Raw material orders',
        icon: 'farmers',
        iconBgColor: 'bg-yellow-100',
        iconTextColor: 'text-yellow-600',
        valueColor: 'text-gray-900',
        trend: {
            value: '+4',
            isUp: true,
            color: 'text-green-600'
        }
    }
];

export const inventoryChartData = [
    {
        title: 'Raw Material Distribution',
        data: [65, 35], // Green Pepper, Black Pepper
        labels: ['Green Pepper', 'Black Pepper'],
        backgroundColor: ['#10B981', '#1F2937']
    },
    {
        title: 'Product Stock Status',
        data: [45, 30, 15, 10], // In Stock, Low Stock, Out of Stock, Expiring Soon
        labels: ['In Stock', 'Low Stock', 'Out of Stock', 'Expiring Soon'],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#F97316']
    }
];

// Helper functions to update stats with real data
export const updateInventoryStats = (baseStats, realData) => {
    return baseStats.map(stat => {
        switch (stat.title) {
            case 'Total Raw Materials':
                return {
                    ...stat,
                    value: realData.rawMaterials?.total || stat.value,
                    subtitle: realData.rawMaterials?.subtitle || stat.subtitle
                };
            case 'Finished Products':
                return {
                    ...stat,
                    value: realData.products?.total || stat.value,
                    subtitle: realData.products?.subtitle || stat.subtitle
                };
            case 'Low Stock Items':
                return {
                    ...stat,
                    value: realData.lowStock?.count || stat.value,
                    subtitle: realData.lowStock?.subtitle || stat.subtitle
                };
            case 'Pending Orders':
                return {
                    ...stat,
                    value: realData.pendingOrders?.count || stat.value,
                    subtitle: realData.pendingOrders?.subtitle || stat.subtitle
                };
            default:
                return stat;
        }
    });
};

export const updateInventoryCharts = (baseCharts, realData) => {
    return baseCharts.map(chart => {
        switch (chart.title) {
            case 'Raw Material Distribution':
                return {
                    ...chart,
                    data: realData.rawMaterialDistribution || chart.data
                };
            case 'Product Stock Status':
                return {
                    ...chart,
                    data: realData.productStockStatus || chart.data
                };
            default:
                return chart;
        }
    });
};