import React, { useState, useEffect } from 'react';
import { generateSalarySlipPDF } from '../../utils/salarySlipGenerator.js';

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

    const handleGeneratePDF = async (salary) => {
        try {
            // Prepare data for PDF generation from salary record
            const pdfData = {
                employeeId: salary.employeeId,
                employeeName: salary.employeeName,
                designation: salary.designation,
                month: salary.month,
                year: salary.year,
                basicSalary: salary.basicSalary,
                attendanceData: salary.attendanceData,
                allowances: salary.allowances,
                deductions: salary.deductions,
                companyContributions: salary.companyContributions,
                totalAllowances: salary.totalAllowances,
                totalDeductions: salary.totalDeductions,
                grossSalary: salary.grossSalary,
                netSalary: salary.netSalary
            };

            // Generate PDF using the same utility as CalculateSalary
            await generateSalarySlipPDF(pdfData, salary);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
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
        <div className="space-y-6 p-6 min-h-screen" style={{ background: 'linear-gradient(135deg, #b2f5ea 0%, #a7f3d0 100%)' }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Salary Records</h1>
                <div className="bg-blue-50 rounded-lg shadow p-4 text-sm text-gray-700">
                    {salaries.length} records
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
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

                <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
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

                <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm">
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

                <div className="bg-purple-100 border-l-4 border-purple-500 rounded-lg p-4 shadow-sm">
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
            </div>

            {/* Filters */}
            <div className="bg-blue-50 rounded-lg shadow mb-6 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Year:</label>
                        <select
                            value={filters.year}
                            onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                            className="px-3 py-2 border border-green-400 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-500"
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
                            className="px-3 py-2 border border-green-400 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-500"
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
                            className="px-3 py-2 border border-green-400 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-500 min-w-48"
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
            <div className="bg-blue-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full w-full">
                        <thead className="bg-green-700">
                            <tr>
                                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Employee ID</th>
                                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Designation</th>
                                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Period</th>
                                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Basic Salary</th>
                                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Allowances</th>
                                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Deductions</th>
                                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Net Salary</th>
                                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Created</th>
                                <th className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="10" className="py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                                        Loading salary records...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="10" className="py-12 text-center text-red-600">
                                        Error: {error}
                                    </td>
                                </tr>
                            ) : salaries.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="py-12 text-center text-gray-500">
                                        No salary records found
                                    </td>
                                </tr>
                            ) : (
                                salaries.map((salary, idx) => (
                                    <tr key={salary._id} className={idx % 2 === 0 ? "bg-green-50" : "bg-white hover:bg-green-100"}>
                                        <td className="px-2 py-2 font-medium text-gray-900">{salary.employeeName}</td>
                                        <td className="px-2 py-2 text-gray-900 font-mono">{salary.employeeId}</td>
                                        <td className="px-2 py-2 text-gray-900">{salary.designation}</td>
                                        <td className="px-2 py-2 text-gray-900">{getMonthName(salary.month)} {salary.year}</td>
                                        <td className="px-2 py-2 text-gray-900 font-medium">{formatCurrency(salary.basicSalary)}</td>
                                        <td className="px-2 py-2 text-green-600 font-medium">{formatCurrency(salary.totalAllowances)}</td>
                                        <td className="px-2 py-2 text-red-600 font-medium">{formatCurrency(salary.totalDeductions)}</td>
                                        <td className="px-2 py-2 font-bold text-gray-900">{formatCurrency(salary.netSalary)}</td>
                                        <td className="px-2 py-2 text-gray-500">{formatDate(salary.createdAt)}</td>
                                        <td className="px-2 py-2 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleGeneratePDF(salary)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors inline-flex items-center whitespace-nowrap"
                                                    title="Generate PDF"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    PDF
                                                </button>
                                                <button
                                                    onClick={() => deleteSalary(salary._id)}
                                                    className="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors inline-flex items-center whitespace-nowrap"
                                                    title="Delete Record"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalaryList;
