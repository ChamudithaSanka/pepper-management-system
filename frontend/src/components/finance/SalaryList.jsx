import React, { useState, useEffect } from 'react';

const SalaryList = () => {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        month: '',
        year: new Date().getFullYear(),
        employeeId: ''
    });
    const [employees, setEmployees] = useState([]);
    const [stats, setStats] = useState({});

    useEffect(() => {
        fetchSalaries();
        fetchEmployees();
        fetchStats();
    }, [filters]);

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.month) params.append('month', filters.month);
            if (filters.year) params.append('year', filters.year);
            if (filters.employeeId) params.append('employeeId', filters.employeeId);
            
            const url = params.toString() 
                ? `/api/salaries?${params.toString()}`
                : '/api/salaries';
                
            const response = await fetch(url, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch salaries');

            const data = await response.json();
            setSalaries(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await fetch('/api/employees', {
                credentials: 'include'
            });

            if (!response.ok) return;

            const data = await response.json();
            setEmployees(data.data || []);
        } catch (err) {
            console.error('Failed to fetch employees:', err);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/salaries/stats', {
                credentials: 'include'
            });

            if (!response.ok) return;

            const data = await response.json();
            setStats(data.data || {});
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const deleteSalary = async (salaryId) => {
        if (!window.confirm('Are you sure you want to delete this salary record?')) {
            return;
        }

        try {
            const response = await fetch(`/api/salaries/${salaryId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to delete salary');

            fetchSalaries();
            fetchStats();
        } catch (err) {
            alert('Failed to delete salary: ' + err.message);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getMonthName = (monthNumber) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthNumber - 1] || '';
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Salary Records</h1>
                <p className="text-gray-600 mt-1">View and manage all submitted salary records</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Records</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalSalaries || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Net Pay</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {formatCurrency(stats.totalNetPay || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100">
                            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Average Salary</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {formatCurrency(stats.averageNetSalary || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total EPF</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {formatCurrency(stats.totalEPF || 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow mb-6 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Year:</label>
                        <select
                            value={filters.year}
                            onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Month:</label>
                        <select
                            value={filters.month}
                            onChange={(e) => setFilters({...filters, month: e.target.value})}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Months</option>
                            {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                                <option key={month} value={month}>{getMonthName(month)}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Employee:</label>
                        <select
                            value={filters.employeeId}
                            onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-w-48"
                        >
                            <option value="">All Employees</option>
                            {employees.map((employee) => (
                                <option key={employee._id} value={employee.employeeId}>
                                    {employee.name} ({employee.employeeId})
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {(filters.month || filters.employeeId) && (
                        <button
                            onClick={() => setFilters({...filters, month: '', employeeId: ''})}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Salary Records Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Salary Records</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading salary records...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <svg className="h-12 w-12 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="mt-4 text-red-600">Error: {error}</p>
                    </div>
                ) : salaries.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-4 text-gray-600">No salary records found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Employee
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Basic Salary
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Allowances
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deductions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Net Salary
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {salaries.map((salary) => (
                                    <tr key={salary._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">{salary.employeeName}</div>
                                            <div className="text-sm text-gray-500">{salary.employeeId} • {salary.designation}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getMonthName(salary.month)} {salary.year}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(salary.basicSalary)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                            {formatCurrency(salary.totalAllowances)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                            {formatCurrency(salary.totalDeductions)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            {formatCurrency(salary.netSalary)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(salary.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => window.open(`/api/salaries/${salary._id}/pdf`, '_blank')}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Download PDF"
                                            >
                                                📄 PDF
                                            </button>
                                            <button
                                                onClick={() => deleteSalary(salary._id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete Record"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalaryList;
