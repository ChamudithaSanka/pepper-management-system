import React, { useState, useEffect } from 'react';
import { generateSalarySlipPDF } from '../../utils/salarySlipGenerator.js';

const CalculateSalary = ({ preSelectedEmployee = null, onBack = null }) => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Attendance details
    const [attendanceData, setAttendanceData] = useState({
        month: new Date().getMonth() + 1,
        workingDays: 22,
        otHours: 0,
        noPayDays: 0
    });

    // Allowances
    const [allowances, setAllowances] = useState({
        food: 0,
        medical: 0,
        bonus: 0
    });

    // Loans & Advances
    const [deductions, setDeductions] = useState({
        loans: 0,
        advances: 0
    });

    // Calculated values - now received from backend
    const [calculations, setCalculations] = useState({
        basicSalary: 0,
        perDaySalary: 0,
        hourlyRate: 0,
        breakdown: {
            allowances: {
                foodAllowance: 0,
                medicalAllowance: 0,
                bonus: 0,
                otPay: 0
            },
            deductions: {
                noPayAmount: 0,
                epfEmployee: 0,
                loans: 0,
                advances: 0
            },
            companyContributions: {
                epfCompany: 0,
                etfCompany: 0
            }
        },
        totalAllowances: 0,
        totalDeductions: 0,
        grossSalary: 0,
        netSalary: 0
    });

    useEffect(() => {
        fetchEmployees();
        // If preSelectedEmployee is provided, set it as selected
        if (preSelectedEmployee) {
            setSelectedEmployee(preSelectedEmployee);
            setSearchTerm(preSelectedEmployee.name);
        }
    }, [preSelectedEmployee]);

    useEffect(() => {
        if (selectedEmployee) {
            // Only show basic salary when employee is selected, don't calculate full salary
            setCalculations(prev => ({
                ...prev,
                basicSalary: selectedEmployee.basicSalary || 0
            }));
        }
    }, [selectedEmployee]);

    const fetchEmployees = async () => {
        try {
            const response = await fetch('/api/employees', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setEmployees(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            setError('Failed to fetch employees');
        }
    };

    const calculateSalary = async () => {
        if (!selectedEmployee) return;

        try {
            const requestData = {
                employeeId: selectedEmployee.employeeId,
                attendanceData: {
                    month: attendanceData.month,
                    workingDays: attendanceData.workingDays,
                    otHours: attendanceData.otHours,
                    noPayDays: attendanceData.noPayDays
                },
                allowances: {
                    foodAllowance: allowances.food,
                    medicalAllowance: allowances.medical,
                    bonus: allowances.bonus
                },
                deductions: {
                    loans: deductions.loans,
                    advances: deductions.advances
                }
            };

            const response = await fetch('/api/salaries/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                const data = await response.json();
                setCalculations(data.data.calculation);
                setError('');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to calculate salary');
            }
        } catch (error) {
            console.error('Error calculating salary:', error);
            setError('Error calculating salary');
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toString().includes(searchTerm) ||
        emp.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEmployeeSelect = (employee) => {
        setSelectedEmployee(employee);
        setSearchTerm(employee.name);
        setShowDropdown(false);
    };

    const handleSubmit = async () => {
        if (!selectedEmployee) {
            setError('Please select an employee');
            return;
        }

        setLoading(true);
        try {
            const salaryData = {
                employeeId: selectedEmployee.employeeId,
                month: attendanceData.month,
                year: new Date().getFullYear(),
                attendanceData: {
                    workingDays: attendanceData.workingDays,
                    otHours: attendanceData.otHours,
                    noPayDays: attendanceData.noPayDays
                },
                allowances: {
                    foodAllowance: allowances.food,
                    medicalAllowance: allowances.medical,
                    bonus: allowances.bonus
                },
                deductions: {
                    loans: deductions.loans,
                    advances: deductions.advances
                }
            };

            const response = await fetch('/api/salaries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(salaryData)
            });

            if (response.ok) {
                alert('Salary calculated and saved successfully!');
                // Reset form
                setSelectedEmployee(null);
                setSearchTerm('');
                setAttendanceData({
                    month: new Date().getMonth() + 1,
                    workingDays: 22,
                    otHours: 0,
                    noPayDays: 0
                });
                setAllowances({ food: 0, medical: 0, bonus: 0 });
                setDeductions({ loans: 0, advances: 0 });
                setCalculations({
                    basicSalary: 0,
                    perDaySalary: 0,
                    hourlyRate: 0,
                    breakdown: {
                        allowances: {
                            foodAllowance: 0,
                            medicalAllowance: 0,
                            bonus: 0,
                            otPay: 0
                        },
                        deductions: {
                            noPayAmount: 0,
                            epfEmployee: 0,
                            loans: 0,
                            advances: 0
                        },
                        companyContributions: {
                            epfCompany: 0,
                            etfCompany: 0
                        }
                    },
                    totalAllowances: 0,
                    totalDeductions: 0,
                    grossSalary: 0,
                    netSalary: 0
                });
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to save salary calculation');
            }
        } catch (error) {
            console.error('Error saving salary:', error);
            setError('Error saving salary calculation');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePDF = async () => {
        if (!selectedEmployee) {
            setError('Please select an employee first');
            return;
        }

        try {
            // Prepare data for PDF generation
            const pdfData = {
                employeeId: selectedEmployee.employeeId,
                employeeName: selectedEmployee.name,
                designation: selectedEmployee.designation,
                month: attendanceData.month,
                year: new Date().getFullYear(),
                basicSalary: calculations.basicSalary || selectedEmployee.basicSalary || 0,
                attendanceData: {
                    workingDays: attendanceData.workingDays,
                    otHours: attendanceData.otHours,
                    noPayDays: attendanceData.noPayDays
                },
                allowances: {
                    foodAllowance: allowances.food,
                    medicalAllowance: allowances.medical,
                    bonus: allowances.bonus,
                    otPay: calculations.breakdown?.allowances?.otPay || 0
                },
                deductions: {
                    noPayAmount: calculations.breakdown?.deductions?.noPayAmount || 0,
                    epfEmployee: calculations.breakdown?.deductions?.epfEmployee || 0,
                    loans: deductions.loans,
                    advances: deductions.advances
                },
                companyContributions: {
                    epfCompany: calculations.breakdown?.companyContributions?.epfCompany || 0,
                    etfCompany: calculations.breakdown?.companyContributions?.etfCompany || 0
                },
                totalAllowances: calculations.totalAllowances || 0,
                totalDeductions: calculations.totalDeductions || 0,
                grossSalary: calculations.grossSalary || 0,
                netSalary: calculations.netSalary || 0
            };

            // Generate PDF
            await generateSalarySlipPDF(pdfData, selectedEmployee);
        } catch (error) {
            console.error('Error generating PDF:', error);
            setError('Error generating PDF. Please try again.');
        }
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
    <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Calculate Salary</h2>
            </div>
            {/* Employee Search Dropdown - Only show if no preSelectedEmployee */}
            {!preSelectedEmployee && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-medium mb-4">Select Employee</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search employee by name, ID, or designation..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {showDropdown && filteredEmployees.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                                {filteredEmployees.map((employee) => (
                                    <div
                                        key={employee._id}
                                        onClick={() => handleEmployeeSelect(employee)}
                                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="font-medium text-gray-900">{employee.name}</div>
                                        <div className="text-sm text-gray-500">
                                            ID: {employee.employeeId} | {employee.designation}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

         
            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                    <button onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700">×</button>
                </div>
            )}

            {/* Main Content Container - 2 Column Layout */}
            <div>
                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Employee Info & Attendance */}
                        <div className="space-y-6">
                            {/* Employee Information */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm border-l-4 border-l-blue-500">
                                <h3 className="text-lg font-medium mb-4 flex items-center text-blue-700">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Employee Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                                        <input
                                            type="text"
                                            value={selectedEmployee?.employeeId || ''}
                                            readOnly
                                            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                        <input
                                            type="text"
                                            value={selectedEmployee?.designation || ''}
                                            readOnly
                                            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={selectedEmployee?.name || ''}
                                            readOnly
                                            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">EPF Number</label>
                                        <input
                                            type="text"
                                            value={selectedEmployee?.employeeId || ''}
                                            readOnly
                                            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Attendance Details */}
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 shadow-sm border-l-4 border-l-purple-500">
                                <h3 className="text-lg font-medium mb-4 flex items-center text-purple-700">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Attendance Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                        <select
                                            value={attendanceData.month}
                                            onChange={(e) => setAttendanceData({...attendanceData, month: parseInt(e.target.value)})}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            {months.map((month, index) => (
                                                <option key={index} value={index + 1}>{month}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
                                        <input
                                            type="number"
                                            value={attendanceData.workingDays}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(31, parseInt(e.target.value) || 0));
                                                setAttendanceData({...attendanceData, workingDays: value});
                                            }}
                                            onFocus={(e) => e.target.value = ''}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            min="0"
                                            max="31"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">OT Hours</label>
                                        <input
                                            type="number"
                                            value={attendanceData.otHours}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(200, parseFloat(e.target.value) || 0));
                                                setAttendanceData({...attendanceData, otHours: value});
                                            }}
                                            onFocus={(e) => e.target.value = ''}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            min="0"
                                            max="200"
                                            step="0.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">No Pay Days</label>
                                        <input
                                            type="number"
                                            value={attendanceData.noPayDays}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(attendanceData.workingDays, parseInt(e.target.value) || 0));
                                                setAttendanceData({...attendanceData, noPayDays: value});
                                            }}
                                            onFocus={(e) => e.target.value = ''}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            min="0"
                                            max={attendanceData.workingDays}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Salary, Deductions, Allowances, Summary */}
                        <div className="space-y-6">
                            {/* Salary Calculation */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-1 shadow-sm border-l-4 border-l-yellow-500">
                                <h3 className="text-lg font-medium mb-4 flex items-center text-yellow-700">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                    Salary Calculation
                                </h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
                                    <div className="text-3xl font-bold text-yellow-600">
                                        LKR {calculations.basicSalary?.toLocaleString() || '0'}
                                    </div>
                                    <div className="text-sm text-gray-500">Base salary amount</div>
                                </div>
                            </div>

                            {/* Allowances */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-sm border-l-4 border-l-green-500">
                                <h3 className="text-lg font-medium mb-4 flex items-center text-green-700">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Allowances
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Food Allowance</label>
                                        <input
                                            type="number"
                                            value={allowances.food}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(20000, parseFloat(e.target.value) || 0));
                                                setAllowances({...allowances, food: value});
                                            }}
                                            onFocus={(e) => e.target.value = ''}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            min="0"
                                            max="20000"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Medical Allowance</label>
                                        <input
                                            type="number"
                                            value={allowances.medical}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(50000, parseFloat(e.target.value) || 0));
                                                setAllowances({...allowances, medical: value});
                                            }}
                                            onFocus={(e) => e.target.value = ''}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            min="0"
                                            max="50000"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">OT Pay</label>
                                        <input
                                            type="text"
                                            value={calculations.breakdown?.allowances?.otPay?.toFixed(2) || '0.00'}
                                            readOnly
                                            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-green-600 font-semibold"
                                        />
                                        <div className="text-xs text-gray-500 mt-1">Automatically calculated</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Bonus & Incentives</label>
                                        <input
                                            type="number"
                                            value={allowances.bonus}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(50000, parseFloat(e.target.value) || 0));
                                                setAllowances({...allowances, bonus: value});
                                            }}
                                            onFocus={(e) => e.target.value = ''}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            min="0"
                                            max="50000"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Deductions */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm border-l-4 border-l-red-500">
                                <h3 className="text-lg font-medium mb-4 flex items-center text-red-700">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0l-4-4m4 4l-4 4" />
                                    </svg>
                                    Deductions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">No Pay Amount</label>
                                        <input
                                            type="text"
                                            value={calculations.breakdown?.deductions?.noPayAmount?.toFixed(2) || '0.00'}
                                            readOnly
                                            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-red-600 font-semibold"
                                        />
                                        <div className="text-xs text-gray-500 mt-1">Automatically calculated</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">EPF (Employee 8%)</label>
                                        <input
                                            type="text"
                                            value={calculations.breakdown?.deductions?.epfEmployee?.toFixed(2) || '0.00'}
                                            readOnly
                                            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-red-600 font-semibold"
                                        />
                                        <div className="text-xs text-gray-500 mt-1">Automatically calculated</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Loans & Advances</label>
                                        <input
                                            type="number"
                                            value={deductions.loans}
                                            onChange={(e) => {
                                                const value = Math.max(0, Math.min(1000000, parseFloat(e.target.value) || 0));
                                                setDeductions({...deductions, loans: value});
                                            }}
                                            onFocus={(e) => e.target.value = ''}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                            min="0"
                                            max="1000000"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">EPF (Employer 12%)</label>
                                        <input
                                            type="text"
                                            value={calculations.breakdown?.companyContributions?.epfCompany?.toFixed(2) || '0.00'}
                                            readOnly
                                            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-blue-600 font-semibold"
                                        />
                                        <div className="text-xs text-gray-500 mt-1">Information only</div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-600 mb-1">ETF (Employer 3%)</label>
                                    <input
                                        type="text"
                                        value={calculations.breakdown?.companyContributions?.etfCompany?.toFixed(2) || '0.00'}
                                        readOnly
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-blue-600 font-semibold"
                                    />
                                    <div className="text-xs text-gray-500 mt-1">Information only</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Calculation Summary */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 shadow-sm border-l-4 border-l-indigo-500 mt-6">
                                <h3 className="text-lg font-medium mb-4 flex items-center text-indigo-700">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Calculation Summary
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Total Allowances</label>
                                        <div className="text-xl font-bold text-green-600">
                                            LKR {calculations.totalAllowances?.toFixed(2) || '0.00'}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Total Deductions</label>
                                        <div className="text-xl font-bold text-red-600">
                                            LKR {calculations.totalDeductions?.toFixed(2) || '0.00'}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Gross Salary</label>
                                        <div className="text-xl font-bold text-purple-600">
                                            LKR {calculations.grossSalary?.toFixed(2) || '0.00'}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Net Salary</label>
                                        <div className="text-xl font-bold text-indigo-600">
                                            LKR {calculations.netSalary?.toFixed(2) || '0.00'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Action Buttons at Bottom */}
                            <div className="flex justify-center gap-4 pt-4">
                                <button
                                    onClick={calculateSalary}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    Calculate
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !selectedEmployee}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    {loading ? 'Saving...' : 'Save Salary Record'}
                                </button>
                                <button
                                    onClick={handleGeneratePDF}
                                    disabled={!selectedEmployee}
                                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Generate PDF
                                </button>
                            </div>
                </div>
            </div>
        </div>
    );
};

export default CalculateSalary;