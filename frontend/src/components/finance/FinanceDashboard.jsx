import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import StatCards from '../Dashboard/StatCards';
import PieChart from '../Dashboard/PieChart';
import EmployeeSalary from './EmployeeSalary';
import SalaryList from './SalaryList';
import FarmerPayments from './FarmerPayments';
import MarketplaceIncome from './MarketplaceIncome';
import OtherExpensesView from './OtherExpensesView';
import { 
    financeSidebarLinks, 
    financeUserInfo
} from '../../data/financeData';

const FinanceDashboard = () => {
    const [stats, setStats] = useState([]);
    const [charts, setCharts] = useState([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);

        try {
            // Get current month and year
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();

            // Fetch all payments, employees, farmer payment stats, and salary records in parallel
            const [paymentsRes, employeesRes, farmerStatsRes, salariesRes] = await Promise.all([
                fetch('/api/payments', { credentials: 'include' }),
                fetch('/api/employees', { credentials: 'include' }),
                fetch('/api/farmer-payments/statistics', { credentials: 'include' }),
                fetch(`/api/salaries?month=${currentMonth}&year=${currentYear}`, { credentials: 'include' })
            ]);

            let payments = [];
            let employees = [];
            let farmerStats = {};
            let salaries = [];

            if (paymentsRes && paymentsRes.ok) {
                const data = await paymentsRes.json();
                payments = data.data?.payments || [];
            }
            if (employeesRes && employeesRes.ok) {
                const data = await employeesRes.json();
                employees = data.data || [];
            }
            if (farmerStatsRes && farmerStatsRes.ok) {
                const data = await farmerStatsRes.json();
                farmerStats = data.data || {};
            }
            if (salariesRes && salariesRes.ok) {
                const data = await salariesRes.json();
                salaries = data.data || [];
            }

            // Calculate stats
            const totalSales = payments.length;
            const totalMonthlyFlow = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
            // Sum netSalary from salary records for the current month/year
            const totalSalary = salaries.reduce((sum, s) => sum + (s.netSalary || 0), 0);
            const totalFarmerPayments = farmerStats.totalAmount || 0;
            const totalExpense = totalSalary + totalFarmerPayments;
            const totalProfit = totalMonthlyFlow - totalExpense;

            // Format currency
            const formatCurrency = (amount) =>
                'LKR ' + amount.toLocaleString('en-LK', { minimumFractionDigits: 2 });

            // Build new stats array
            const newStats = [
                {
                    title: 'Total Sales',
                    value: totalSales,
                    valueColor: 'text-blue-600',
                    icon: 'orders',
                    iconBgColor: 'bg-blue-100',
                },
                {
                    title: 'Total Monthly Flow',
                    value: formatCurrency(totalMonthlyFlow),
                    valueColor: 'text-green-600',
                    icon: 'revenue',
                    iconBgColor: 'bg-green-100',
                },
                {
                    title: 'Total Expense',
                    value: formatCurrency(totalExpense),
                    valueColor: 'text-red-600',
                    icon: 'inventory',
                    iconBgColor: 'bg-red-100',
                },
                {
                    title: 'Total Profit',
                    value: formatCurrency(totalProfit),
                    valueColor: totalProfit >= 0 ? 'text-green-600' : 'text-red-600',
                    icon: 'revenue',
                    iconBgColor: totalProfit >= 0 ? 'bg-green-100' : 'bg-red-100',
                },
            ];

            // Chart 1: Income vs Expense
            const chart1 = {
                title: 'Income vs Expense',
                data: {
                    labels: ['Income', 'Expense'],
                    datasets: [{
                        data: [totalMonthlyFlow, totalExpense],
                        backgroundColor: [
                            '#10B981', // green-500
                            '#EF4444', // red-500
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff',
                    }]
                }
            };

            // Chart 2: Monthly Expense Breakdown
            const chart2 = {
                title: 'Monthly Expense Breakdown',
                data: {
                    labels: ['Salary', 'Farmer Payments'],
                    datasets: [{
                        data: [totalSalary, totalFarmerPayments],
                        backgroundColor: [
                            '#F59E0B', // yellow-500
                            '#8B5CF6', // purple-500
                            '#06B6D4', // cyan-500
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff',
                    }]
                }
            };

            setStats(newStats);
            setCharts([chart1, chart2]);

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
                        <FarmerPayments />
                    </div>
                );

            case 'employee-salary':
                return (
                    <div className="space-y-6">
                        <EmployeeSalary />
                    </div>
                );

            case 'salary-records':
                return (
                    <div className="space-y-6">
                        <SalaryList />
                    </div>
                );

            case 'customer-payments':
                return (
                    <div className="space-y-6">
                        <MarketplaceIncome />
                    </div>
                );

            case 'other-expenses':
                return (
                    <div className="space-y-6">
                        <OtherExpensesView />
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