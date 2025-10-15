import React, { useState, useEffect } from 'react';
import CalculateSalary from './CalculateSalary';

const EmployeeSalary = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showCalculateForm, setShowCalculateForm] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
        setFilteredEmployees(data.data || []);
      } else {
        setError('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(emp =>
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId?.toString().includes(searchTerm) ||
      emp.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  const handleCalculateSalary = (employee) => {
    setSelectedEmployee(employee);
    setShowCalculateForm(true);
  };

  const handleBackToList = () => {
    setShowCalculateForm(false);
    setSelectedEmployee(null);
  };

  if (showCalculateForm && selectedEmployee) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={handleBackToList}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Employee List
          </button>
        </div>
        <CalculateSalary preSelectedEmployee={selectedEmployee} onBack={handleBackToList} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ background: 'linear-gradient(135deg, #b2f5ea 0%, #a7f3d0 100%)' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Employees</h2>
        <div className="bg-blue-50 rounded-lg shadow p-4 text-sm text-gray-700">
          {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{employees.filter(emp => emp.status === 'Active').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{employees.filter(emp => emp.status !== 'Active').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-100 border-l-4 border-purple-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Basic Salaries</p>
              <p className="text-2xl font-semibold text-gray-900">LKR {employees.reduce((sum, emp) => sum + (emp.basicSalary || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-blue-50 rounded-lg shadow mb-6 p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search employees"
            value={searchTerm}
            onChange={(e) => {
              // Allow only letters, numbers and spaces in search
              const raw = e.target.value;
              const sanitized = raw.replace(/[^a-zA-Z0-9\s]/g, '');
              setSearchTerm(sanitized);
            }}
            className="w-full pl-10 pr-4 py-3 border border-green-400 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-500"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Employee List */}
      <div className="bg-blue-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full w-full">
            <thead className="bg-green-700">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Employee ID</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Designation</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">NIC</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Phone</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Basic Salary</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                <th className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee, idx) => (
                  <tr key={employee._id} className={idx % 2 === 0 ? "bg-green-50" : "bg-white hover:bg-green-100"}>
                   
                    <td className="px-2 py-2 text-gray-900 font-mono">{employee.name}</td>
                    <td className="px-2 py-2 text-gray-900 font-mono">{employee.employeeId}</td>
                    <td className="px-2 py-2 text-gray-900">{employee.designation}</td>
                    <td className="px-2 py-2 text-gray-500 text-sm">{employee.email || 'N/A'}</td>
                    <td className="px-2 py-2 text-gray-500 text-sm">{employee.nic || 'N/A'}</td>
                    <td className="px-2 py-2 text-gray-500 text-sm">{employee.phoneNumber || 'N/A'}</td>
                    <td className="px-2 py-2 text-gray-900 font-medium">LKR {employee.basicSalary?.toLocaleString() || '0'}</td>
                    <td className="px-2 py-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{employee.status || 'Active'}</span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => handleCalculateSalary(employee)}
                        className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center whitespace-nowrap"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Calculate Salary
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-500">
                    {searchTerm ? 'No employees found matching your search.' : 'No employees found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSalary;
