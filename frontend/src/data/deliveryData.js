// Delivery Dashboard Configuration
export const deliverySidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'drivers', label: 'Drivers', icon: 'deliveries' },
    { id: 'orders', label: 'Orders', icon: 'orders' },
    { id: 'deliveries', label: 'Deliveries', icon: 'deliveries' }
];

export const deliveryUserInfo = {
    brandName: 'Delivery Management',
    brandSubtitle: 'Pepper Management',
    name: 'Delivery Manager',
    role: 'Delivery Manager',
    initial: 'D'
};

export const deliveryStatsData = [
    {
        title: 'Total Drivers',
        value: '0',
        subtitle: 'Available: 0',
        valueColor: 'text-blue-600',
        icon: 'deliveries',
        iconBgColor: 'bg-blue-100',
        trend: {
            isPositive: true,
            percentage: 5,
            period: 'vs last month'
        }
    },
    {
        title: 'Total Orders',
        value: '0',
        subtitle: 'Farmer: 0, Customer: 0',
        valueColor: 'text-green-600',
        icon: 'orders',
        iconBgColor: 'bg-green-100',
        trend: {
            isPositive: true,
            percentage: 12,
            period: 'vs last month'
        }
    },
    {
        title: 'Pending Deliveries',
        value: '0',
        subtitle: 'Awaiting assignment',
        valueColor: 'text-orange-600',
        icon: 'orders',
        iconBgColor: 'bg-orange-100',
        trend: {
            isPositive: false,
            percentage: 8,
            period: 'vs last week'
        }
    },
    {
        title: 'Completed Deliveries',
        value: '0',
        subtitle: 'Successfully delivered',
        valueColor: 'text-purple-600',
        icon: 'deliveries',
        iconBgColor: 'bg-purple-100',
        trend: {
            isPositive: true,
            percentage: 15,
            period: 'vs last month'
        }
    }
];

export const deliveryChartData = [
    {
        title: 'Driver Status Distribution',
        data: {
            labels: ['Available', 'Busy', 'Assigned'],
            datasets: [
                {
                    data: [0, 0, 0],
                    backgroundColor: [
                        '#10B981', // green-500
                        '#EF4444', // red-500
                        '#3B82F6'  // blue-500
                    ],
                    borderColor: [
                        '#047857', // green-700
                        '#DC2626', // red-700
                        '#1E40AF'  // blue-700
                    ],
                    borderWidth: 2
                }
            ]
        }
    },
    {
        title: 'Delivery Status Distribution',
        data: {
            labels: ['Pending', 'Shipped', 'Delivered'],
            datasets: [
                {
                    data: [0, 0, 0],
                    backgroundColor: [
                        '#F59E0B', // yellow-500
                        '#3B82F6', // blue-500
                        '#10B981'  // green-500
                    ],
                    borderColor: [
                        '#D97706', // yellow-700
                        '#1E40AF', // blue-700
                        '#047857'  // green-700
                    ],
                    borderWidth: 2
                }
            ]
        }
    }
];

// Function to update stats with real data
export const updateDeliveryStats = (statsData, realData) => {
    return statsData.map(stat => {
        switch (stat.title) {
            case 'Total Drivers':
                return {
                    ...stat,
                    value: realData.drivers?.total || '0',
                    subtitle: `Available: ${realData.drivers?.available || '0'}`
                };
            case 'Total Orders':
                return {
                    ...stat,
                    value: realData.orders?.total || '0',
                    subtitle: `Farmer: ${realData.orders?.farmerOrders || '0'}, Customer: ${realData.orders?.customerOrders || '0'}`
                };
            case 'Pending Deliveries':
                return {
                    ...stat,
                    value: realData.deliveryTasks?.pending || '0',
                    subtitle: 'Awaiting assignment'
                };
            case 'Completed Deliveries':
                return {
                    ...stat,
                    value: realData.deliveryTasks?.delivered || '0',
                    subtitle: 'Successfully delivered'
                };
            default:
                return stat;
        }
    });
};

// Function to update chart data with real data
export const updateDeliveryCharts = (chartData, realData) => {
    return chartData.map(chart => {
        switch (chart.title) {
            case 'Driver Status Distribution':
                return {
                    ...chart,
                    data: {
                        ...chart.data,
                        datasets: [{
                            ...chart.data.datasets[0],
                            data: [
                                realData.drivers?.available || 0,
                                realData.drivers?.busy || 0,
                                realData.drivers?.assigned || 0
                            ]
                        }]
                    }
                };
            case 'Delivery Status Distribution':
                return {
                    ...chart,
                    data: {
                        ...chart.data,
                        datasets: [{
                            ...chart.data.datasets[0],
                            data: [
                                realData.deliveryTasks?.pending || 0,
                                realData.deliveryTasks?.assigned || 0,
                                realData.deliveryTasks?.delivered || 0
                            ]
                        }]
                    }
                };
            default:
                return chart;
        }
    });
};

