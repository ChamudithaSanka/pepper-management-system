// Finance Dashboard Configuration
export const financeSidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'farmer-payments', label: 'Farmer Payments', icon: 'farmers' },
    { id: 'employee-salary', label: 'Employee Salary', icon: 'employees' },
    { id: 'customer-payments', label: 'Customer Payments', icon: 'customers' }
];

export const financeUserInfo = {
    brandName: 'Finance Panel',
    brandSubtitle: 'Financial Management',
    name: 'Finance Manager',
    role: 'Finance',
    initial: 'F'
};

export const financeStatsData = [
    {
        title: 'Pending Farmer Payments',
        value: '12',
        subtitle: 'Awaiting approval',
        valueColor: 'text-blue-600',
        icon: 'farmers',
        iconBgColor: 'bg-blue-100',
        trend: {
            value: '+2',
            isUp: true,
            color: 'text-blue-600'
        }
    },
    {
        title: 'Monthly Salary Budget',
        value: 'LKR 245,000',
        subtitle: 'This month',
        valueColor: 'text-green-600',
        icon: 'employees',
        iconBgColor: 'bg-green-100',
        trend: {
            value: '+5%',
            isUp: true,
            color: 'text-green-600'
        }
    },
    {
        title: 'Customer Payment Issues',
        value: '8',
        subtitle: 'Pending resolution',
        valueColor: 'text-red-600',
        icon: 'customers',
        iconBgColor: 'bg-red-100',
        trend: {
            value: '-3',
            isUp: false,
            color: 'text-green-600'
        }
    },
    {
        title: 'Total Monthly Flow',
        value: 'LKR 1,250,000',
        subtitle: 'Revenue this month',
        valueColor: 'text-yellow-600',
        icon: 'finance',
        iconBgColor: 'bg-yellow-100',
        trend: {
            value: '+12%',
            isUp: true,
            color: 'text-green-600'
        }
    }
];

export const financeChartData = [
    {
        title: 'Payment Distribution',
        data: {
            labels: ['Farmer Payments', 'Employee Salaries', 'Customer Refunds', 'Operational Costs'],
            datasets: [{
                data: [35, 40, 15, 10],
                backgroundColor: [
                    '#3B82F6', // blue-500
                    '#10B981', // green-500  
                    '#F59E0B', // yellow-500
                    '#EF4444'  // red-500
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        }
    },
    {
        title: 'Monthly Expense Breakdown',
        data: {
            labels: ['Salaries', 'Farmer Purchases', 'Operations', 'Maintenance'],
            datasets: [{
                data: [45, 30, 15, 10],
                backgroundColor: [
                    '#8B5CF6', // purple-500
                    '#06B6D4', // cyan-500
                    '#84CC16', // lime-500  
                    '#F97316'  // orange-500
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        }
    }
];

// Functions to update stats with real data
export const updateFinanceStats = (baseStats, realData) => {
    return baseStats.map(stat => {
        switch (stat.title) {
            case 'Pending Farmer Payments':
                return {
                    ...stat,
                    value: realData.farmerPayments?.pending || '0',
                    subtitle: realData.farmerPayments?.subtitle || 'Awaiting approval'
                };
            case 'Monthly Salary Budget':
                return {
                    ...stat,
                    value: realData.salaryBudget?.total || 'LKR 0',
                    subtitle: realData.salaryBudget?.subtitle || 'This month'
                };
            case 'Customer Payment Issues':
                return {
                    ...stat,
                    value: realData.customerIssues?.count || '0',
                    subtitle: realData.customerIssues?.subtitle || 'Pending resolution'
                };
            case 'Total Monthly Flow':
                return {
                    ...stat,
                    value: realData.totalFlow?.amount || 'LKR 0',
                    subtitle: realData.totalFlow?.subtitle || 'Revenue this month'
                };
            default:
                return stat;
        }
    });
};

export const updateFinanceCharts = (baseCharts, realData) => {
    return baseCharts.map(chart => {
        if (chart.title === 'Payment Distribution') {
            return {
                ...chart,
                data: {
                    ...chart.data,
                    datasets: [{
                        ...chart.data.datasets[0],
                        data: realData.paymentDistribution || [35, 40, 15, 10]
                    }]
                }
            };
        }
        if (chart.title === 'Monthly Expense Breakdown') {
            return {
                ...chart,
                data: {
                    ...chart.data,
                    datasets: [{
                        ...chart.data.datasets[0],
                        data: realData.expenseBreakdown || [45, 30, 15, 10]
                    }]
                }
            };
        }
        return chart;
    });
};