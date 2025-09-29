import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const EmployeeManagement = ({ onStatsUpdate }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        designation: '',
        nic: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        basicSalary: ''
    });

    useEffect(() => {
        fetchEmployees();
    }, [statusFilter]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }
            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const response = await fetch(`/api/employees?${params}`);
            const data = await response.json();

            if (data.success) {
                setEmployees(data.data);
                // Update stats if callback provided
                if (onStatsUpdate) {
                    fetchStats();
                }
            } else {
                setError(data.message || 'Failed to fetch employees');
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            setError('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/employees/stats');
            const data = await response.json();
            
            if (data.success && onStatsUpdate) {
                onStatsUpdate(data.data);
            }
        } catch (error) {
            console.error('Error fetching employee stats:', error);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newEmployee,
                    basicSalary: parseFloat(newEmployee.basicSalary)
                }),
            });

            const data = await response.json();

            if (data.success) {
                setNewEmployee({ name: '', designation: '', nic: '', phoneNumber: '', address: '', dateOfBirth: '', basicSalary: '' });
                setShowAddForm(false);
                fetchEmployees();
                setError('');
            } else {
                setError(data.message || 'Failed to add employee');
            }
        } catch (error) {
            console.error('Error adding employee:', error);
            setError('Failed to add employee');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (employeeId, updatedData) => {
        setLoading(true);
        
        try {
            const response = await fetch(`/api/employees/${employeeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...updatedData,
                    basicSalary: parseFloat(updatedData.basicSalary)
                }),
            });

            const data = await response.json();

            if (data.success) {
                setEditingEmployee(null);
                fetchEmployees();
                setError('');
            } else {
                setError(data.message || 'Failed to update employee');
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            setError('Failed to update employee');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (employeeId) => {
        if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch(`/api/employees/${employeeId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                fetchEmployees();
                setError('');
            } else {
                setError(data.message || 'Failed to delete employee');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            setError('Failed to delete employee');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (employeeId) => {
        setLoading(true);
        
        try {
            const response = await fetch(`/api/employees/${employeeId}/toggle-status`, {
                method: 'PUT',
            });

            const data = await response.json();

            if (data.success) {
                fetchEmployees();
                setError('');
            } else {
                setError(data.message || 'Failed to update employee status');
            }
        } catch (error) {
            console.error('Error updating employee status:', error);
            setError('Failed to update employee status');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchEmployees();
    };

    const filteredEmployees = employees.filter(employee =>
        employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    {showAddForm ? 'Cancel' : 'Add Employee'}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button 
                        onClick={() => setError('')}
                        className="text-red-500 hover:text-red-700 ml-4"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Search and Filter Controls */}
            <div className="flex justify-between items-center gap-4">
                <div className="max-w-md flex-1">
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => {
                            const sanitized = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                            setSearchTerm(sanitized);
                        }}
                        className="w-full border border-green-400 bg-green-50 text-green-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-500 placeholder-green-700"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-green-400 bg-green-50 text-green-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-500"
                >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
                <button
                    onClick={handleSearch}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Search
                </button>
            </div>

            {/* Add Employee Modal */}
            {showAddForm && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-medium mb-4">Add New Employee</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={newEmployee.name}
                                    maxLength={100}
                                    onChange={(e) => {
                                        // Only letters and spaces, max 100 chars
                                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 100);
                                        setNewEmployee({...newEmployee, name: value});
                                    }}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Designation *
                                </label>
                                <select
                                    value={newEmployee.designation}
                                    onChange={(e) => setNewEmployee({...newEmployee, designation: e.target.value})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Designation</option>
                                    <option value="Drying Operator">Drying Operator</option>
                                    <option value="Cleaning Operator">Cleaning Operator</option>
                                    <option value="Grinding Operator">Grinding Operator</option>
                                    <option value="Packaging Operator">Packaging Operator</option>
                                    <option value="Machine Operator">Machine Operator</option>
                                    <option value="Helper">Helper</option>
                                    <option value="Raw Material Inspector">Raw Material Inspector</option>
                                </select>
                            </div>
                            {/* Email removed per request */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    NIC Number *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter NIC number (123456789V or 200012345678)"
                                    value={newEmployee.nic}
                                    maxLength={12}
                                    onChange={(e) => {
                                        // Only digits and V/X, max 12 chars
                                        const value = e.target.value.replace(/[^0-9vVxX]/g, '').slice(0, 12);
                                        setNewEmployee({...newEmployee, nic: value});
                                    }}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mobile Number *
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Enter mobile number (10 digits)"
                                    value={newEmployee.phoneNumber}
                                    maxLength={10}
                                    onChange={(e) => {
                                        // Only digits, exactly 10 chars for Sri Lankan mobile
                                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                        setNewEmployee({...newEmployee, phoneNumber: value});
                                    }}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address *
                                </label>
                                <textarea
                                    placeholder="Enter address (letters, numbers, spaces, punctuation allowed)"
                                    value={newEmployee.address}
                                    maxLength={500}
                                    onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value.slice(0, 500)})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent break-words whitespace-normal"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    placeholder="Date of Birth"
                                    value={newEmployee.dateOfBirth}
                                    onChange={(e) => setNewEmployee({...newEmployee, dateOfBirth: e.target.value})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Basic Salary (LKR) *
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter basic salary"
                                    value={newEmployee.basicSalary}
                                    max={999999}
                                    onChange={(e) => {
                                        const value = Math.max(0, Math.min(999999, Number(e.target.value) || 0));
                                        setNewEmployee({...newEmployee, basicSalary: value});
                                    }}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors flex-1"
                                >
                                    {loading ? 'Adding...' : 'Add Employee'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded font-medium transition-colors flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Employees Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-500">Loading employees...</div>
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400">
                            {searchTerm 
                                ? 'No employees found matching your search.' 
                                : 'No employees found.'
                            }
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-2 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Employee ID</th>
                                    <th className="px-2 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                                    <th className="px-2 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Designation</th>
                                    {/* Email column removed */}
                                    <th className="px-2 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">NIC</th>
                                    <th className="px-2 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Phone</th>
                                    <th className="px-2 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Address</th>
                                    <th className="px-2 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Date of Birth</th>
                                    <th className="px-2 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Salary</th>
                                    <th className="px-2 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                    <th className="px-2 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((employee, idx) => (
                                    <tr key={employee._id} className={idx % 2 === 0 ? "bg-green-50" : "bg-white hover:bg-green-100"}>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {employee.employeeId}
                                        </td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {employee.name}
                                        </td>
                                        <td className="px-2 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                                {employee.designation}
                                            </span>
                                        </td>
                                        {/* email removed */}
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {employee.nic || 'N/A'}
                                        </td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {employee.phoneNumber || 'N/A'}
                                        </td>
                                        <td className="px-2 py-4 text-sm text-gray-500 break-words whitespace-normal max-w-xs">
                                            {employee.address || 'N/A'}
                                        </td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">LKR {employee.basicSalary?.toLocaleString()}</td>
                                        <td className="px-2 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                employee.status === 'Active' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {employee.status}
                                            </span>
                                        </td>
                                        <td className="px-2 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => setEditingEmployee(employee)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-medium transition-colors shadow-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleStatusToggle(employee._id)}
                                                className={`px-3 py-1 rounded-lg font-medium transition-colors shadow-sm ${
                                                    employee.status === 'Active' 
                                                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                }`}
                                            >
                                                {employee.status === 'Active' ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(employee._id)}
                                                className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg font-medium transition-colors shadow-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-medium mb-4">Edit Employee</h3>
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdate(editingEmployee._id, editingEmployee);
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={editingEmployee.name}
                                    maxLength={100}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 100);
                                        setEditingEmployee({...editingEmployee, name: value});
                                    }}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Designation *
                                </label>
                                <select
                                    value={editingEmployee.designation}
                                    onChange={(e) => setEditingEmployee({...editingEmployee, designation: e.target.value})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                >
                                    <option value="Drying Operator">Drying Operator</option>
                                    <option value="Cleaning Operator">Cleaning Operator</option>
                                    <option value="Grinding Operator">Grinding Operator</option>
                                    <option value="Packaging Operator">Packaging Operator</option>
                                    <option value="Machine Operator">Machine Operator</option>
                                    <option value="Helper">Helper</option>
                                    <option value="Raw Material Inspector">Raw Material Inspector</option>
                                </select>
                            </div>
                            {/* Email removed per request */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    NIC Number *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter NIC number (123456789V or 200012345678)"
                                    value={editingEmployee.nic || ''}
                                    maxLength={12}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9vVxX]/g, '').slice(0, 12);
                                        setEditingEmployee({...editingEmployee, nic: value});
                                    }}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mobile Number *
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Enter mobile number (10 digits)"
                                    value={editingEmployee.phoneNumber || ''}
                                    maxLength={10}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                        setEditingEmployee({...editingEmployee, phoneNumber: value});
                                    }}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address *
                                </label>
                                <textarea
                                    placeholder="Enter address (letters, numbers, spaces, punctuation allowed)"
                                    value={editingEmployee.address || ''}
                                    maxLength={500}
                                    onChange={(e) => setEditingEmployee({...editingEmployee, address: e.target.value.slice(0, 500)})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent break-words whitespace-normal"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    placeholder="Date of Birth"
                                    value={editingEmployee.dateOfBirth ? editingEmployee.dateOfBirth.split('T')[0] : ''}
                                    onChange={(e) => setEditingEmployee({...editingEmployee, dateOfBirth: e.target.value})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Basic Salary (LKR) *
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter basic salary"
                                    value={editingEmployee.basicSalary}
                                    max={999999}
                                    onChange={(e) => {
                                        const value = Math.max(0, Math.min(999999, Number(e.target.value) || 0));
                                        setEditingEmployee({...editingEmployee, basicSalary: value});
                                    }}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={editingEmployee.status}
                                    onChange={(e) => setEditingEmployee({...editingEmployee, status: e.target.value})}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors flex-1"
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingEmployee(null)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded font-medium transition-colors flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;