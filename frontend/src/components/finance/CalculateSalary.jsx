import React, { useState, useEffect } from 'react';

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
            calculateSalary();
        }
    }, [selectedEmployee, attendanceData, allowances, deductions]);

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

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Calculate Salary</h2>
                <div className="flex gap-3">
                    <button
                        onClick={calculateSalary}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Calculate
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !selectedEmployee}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        {loading ? 'Saving...' : 'Submit & Calculate'}
                    </button>
                </div>
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

            {/* Selected Employee Info - Show when preSelectedEmployee is provided */}
            {preSelectedEmployee && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-medium mb-4 text-green-800">Selected Employee</h3>
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                            <span className="text-white font-medium text-lg">
                                {preSelectedEmployee.name?.charAt(0)?.toUpperCase() || 'E'}
                            </span>
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">{preSelectedEmployee.name}</div>
                            <div className="text-sm text-gray-600">
                                ID: {preSelectedEmployee.employeeId} | {preSelectedEmployee.designation}
                            </div>
                        </div>
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

            <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Employee Info & Attendance */}
                <div className="col-span-2 space-y-6">
                    {/* Employee Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                            <span className="mr-2">👤</span> Employee Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
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
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                            <span className="mr-2">📅</span> Attendance Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                <select
                                    value={attendanceData.month}
                                    onChange={(e) => setAttendanceData({...attendanceData, month: parseInt(e.target.value)})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                    onChange={(e) => setAttendanceData({...attendanceData, workingDays: parseInt(e.target.value) || 0})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    min="0"
                                    max="31"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">OT Hours</label>
                                <input
                                    type="number"
                                    value={attendanceData.otHours}
                                    onChange={(e) => setAttendanceData({...attendanceData, otHours: parseFloat(e.target.value) || 0})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    min="0"
                                    step="0.5"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">No Pay Days</label>
                                <input
                                    type="number"
                                    value={attendanceData.noPayDays}
                                    onChange={(e) => setAttendanceData({...attendanceData, noPayDays: parseInt(e.target.value) || 0})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    min="0"
                                    max="31"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Salary Calculation */}
                <div className="space-y-6">
                    {/* Basic Salary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                            <span className="mr-2">💰</span> Salary Calculation
                        </h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
                            <div className="text-2xl font-bold text-green-600">
                                LKR {calculations.basicSalary?.toLocaleString() || '0'}
                            </div>
                            <div className="text-sm text-gray-500">Base salary amount</div>
                        </div>
                    </div>

                    {/* Deductions and Allowances */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Deductions */}
                            <div>
                                <h4 className="font-medium text-red-600 mb-3 flex items-center">
                                    <span className="mr-1">➖</span> Deductions
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-600">No Pay Amount</label>
                                        <div className="text-sm font-medium text-red-600">
                                            LKR {calculations.breakdown?.deductions?.noPayAmount?.toFixed(2) || '0.00'}
                                        </div>
                                        <div className="text-xs text-gray-500">Automatically calculated</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600">EPF (Employee 8%)</label>
                                        <div className="text-sm font-medium text-red-600">
                                            LKR {calculations.breakdown?.deductions?.epfEmployee?.toFixed(2) || '0.00'}
                                        </div>
                                        <div className="text-xs text-gray-500">Automatically calculated</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600">EPF (Employer 12%)</label>
                                        <div className="text-sm font-medium text-blue-600">
                                            LKR {calculations.breakdown?.companyContributions?.epfCompany?.toFixed(2) || '0.00'}
                                        </div>
                                        <div className="text-xs text-gray-500">Information only - not deducted</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600">ETF (Employer 3%)</label>
                                        <div className="text-sm font-medium text-blue-600">
                                            LKR {calculations.breakdown?.companyContributions?.etfCompany?.toFixed(2) || '0.00'}
                                        </div>
                                        <div className="text-xs text-gray-500">Information only</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600">Loans & Advances</label>
                                        <input
                                            type="number"
                                            value={deductions.loans}
                                            onChange={(e) => setDeductions({...deductions, loans: parseFloat(e.target.value) || 0})}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Allowances */}
                            <div>
                                <h4 className="font-medium text-green-600 mb-3 flex items-center">
                                    <span className="mr-1">➕</span> Allowances
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-600">Food Allowance</label>
                                        <input
                                            type="number"
                                            value={allowances.food}
                                            onChange={(e) => setAllowances({...allowances, food: parseFloat(e.target.value) || 0})}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600">Medical Allowance</label>
                                        <input
                                            type="number"
                                            value={allowances.medical}
                                            onChange={(e) => setAllowances({...allowances, medical: parseFloat(e.target.value) || 0})}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600">OT Pay</label>
                                        <div className="text-sm font-medium text-green-600">
                                            LKR {calculations.breakdown?.allowances?.otPay?.toFixed(2) || '0.00'}
                                        </div>
                                        <div className="text-xs text-gray-500">Automatically calculated from attendance</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600">Bonus & Incentives</label>
                                        <input
                                            type="number"
                                            value={allowances.bonus}
                                            onChange={(e) => setAllowances({...allowances, bonus: parseFloat(e.target.value) || 0})}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-blue-600 text-sm font-medium">Total Allowances</div>
                    <div className="text-2xl font-bold text-blue-700">LKR {calculations.totalAllowances?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div className="text-red-600 text-sm font-medium">Total Deductions</div>
                    <div className="text-2xl font-bold text-red-700">LKR {calculations.totalDeductions?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <div className="text-purple-600 text-sm font-medium">Gross Salary</div>
                    <div className="text-2xl font-bold text-purple-700">LKR {calculations.grossSalary?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-green-600 text-sm font-medium">Net Salary</div>
                    <div className="text-2xl font-bold text-green-700">LKR {calculations.netSalary?.toFixed(2) || '0.00'}</div>
                </div>
            </div>
        </div>
    );
};

export default CalculateSalary;