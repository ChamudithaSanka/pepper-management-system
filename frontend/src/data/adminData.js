// Admin Dashboard Configuration
export const adminSidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'users', label: 'User Management', icon: 'users' },
    { id: 'farmers', label: 'Farmer Management', icon: 'farmers' },
    { id: 'customers', label: 'Customer Management', icon: 'customers' },
    { id: 'employees', label: 'Employee Management', icon: 'employees' },
    { id: 'orders', label: 'Order Management', icon: 'orders' },
    { id: 'inventory', label: 'Inventory Overview', icon: 'inventory' },
    { id: 'finance', label: 'Financial Reports', icon: 'finance' },
    { id: 'reports', label: 'Analytics', icon: 'reports' }
];

export const adminUserInfo = {
    brandName: 'Admin Panel',
    brandSubtitle: 'Pepper Management',
    name: 'Admin User',
    role: 'Administrator',
    initial: 'A'
};

export const adminStatsData = [
    {
        title: 'Total Users',
        value: '0',
        subtitle: 'Active: 0',
        valueColor: 'text-blue-600',
        icon: 'users',
        iconBgColor: 'bg-blue-100',
        trend: {
            isPositive: true,
            percentage: 12,
            period: 'vs last month'
        }
    },
    {
        title: 'Total Farmers',
        value: '0',
        subtitle: 'Active: 0',
        valueColor: 'text-green-600',
        icon: 'farmers',
        iconBgColor: 'bg-green-100',
        trend: {
            isPositive: true,
            percentage: 8,
            period: 'vs last month'
        }
    },
    {
        title: 'Total Customers',
        value: '0',
        subtitle: 'Active: 0',
        valueColor: 'text-purple-600',
        icon: 'customers',
        iconBgColor: 'bg-purple-100',
        trend: {
            isPositive: true,
            percentage: 15,
            period: 'vs last month'
        }
    },
    {
        title: 'Revenue',
        value: 'LKR 0',
        subtitle: 'This month',
        valueColor: 'text-yellow-600',
        icon: 'revenue',
        iconBgColor: 'bg-yellow-100',
        trend: {
            isPositive: true,
            percentage: 15,
            period: 'vs last month'
        }
    }
];

export const adminChartData = [
    {
        title: 'User Role Distribution',
        data: {
            labels: ['Admin', 'Finance Manager', 'Inventory Manager', 'Delivery Staff'],
            datasets: [
                {
                    data: [1, 0, 0, 0],
                    backgroundColor: [
                        '#3B82F6', // blue-500
                        '#10B981', // green-500
                        '#8B5CF6', // purple-500
                        '#F59E0B'  // yellow-500
                    ],
                    borderColor: [
                        '#1E40AF', // blue-700
                        '#047857', // green-700
                        '#6D28D9', // purple-700
                        '#D97706'  // yellow-700
                    ],
                    borderWidth: 2
                }
            ]
        }
    },
    {
        title: 'Farmer Status Distribution',
        data: {
            labels: ['Active Farmers', 'Inactive Farmers', 'Pending Approval'],
            datasets: [
                {
                    data: [0, 0, 0],
                    backgroundColor: [
                        '#10B981', // green-500
                        '#EF4444', // red-500
                        '#F59E0B'  // yellow-500
                    ],
                    borderColor: [
                        '#047857', // green-700
                        '#DC2626', // red-700
                        '#D97706'  // yellow-700
                    ],
                    borderWidth: 2
                }
            ]
        }
    }
];

// Function to update stats with real data
export const updateAdminStats = (statsData, realData) => {
    return statsData.map(stat => {
        switch (stat.icon) {
            case 'users':
                return {
                    ...stat,
                    value: realData.users?.total || '0',
                    subtitle: `Active: ${realData.users?.active || '0'}`
                };
            case 'farmers':
                return {
                    ...stat,
                    value: realData.farmers?.total || '0',
                    subtitle: `Active: ${realData.farmers?.active || '0'}`
                };
            case 'customers':
                return {
                    ...stat,
                    value: realData.customers?.total || '0',
                    subtitle: `Active: ${realData.customers?.active || '0'}`
                };
            case 'revenue':
                return {
                    ...stat,
                    value: realData.revenue?.total || 'LKR 0',
                    subtitle: realData.revenue?.subtitle || 'This month'
                };
            default:
                return stat;
        }
    });
};

// Function to update chart data with real data
export const updateAdminCharts = (chartData, realData) => {
    return chartData.map(chart => {
        switch (chart.title) {
            case 'User Role Distribution':
                return {
                    ...chart,
                    data: {
                        ...chart.data,
                        datasets: [{
                            ...chart.data.datasets[0],
                            data: realData.userRoles || [1, 0, 0, 0]
                        }]
                    }
                };
            case 'Farmer Status Distribution':
                return {
                    ...chart,
                    data: {
                        ...chart.data,
                        datasets: [{
                            ...chart.data.datasets[0],
                            data: realData.farmerStatus || [0, 0, 0]
                        }]
                    }
                };
            default:
                return chart;
        }
    });
};
