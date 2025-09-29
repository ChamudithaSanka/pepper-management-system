import React, { useState, useEffect, useRef } from 'react';

const OtherExpensesView = () => {
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [stats, setStats] = useState({
        totalExpenses: 0,
        totalAmount: 0,
        electricityAmount: 0
    });
    const [newExpense, setNewExpense] = useState({
        expenseType: '',
        description: '',
        amount: '',
        expenseDate: '',
        paymentMethod: '',
        receiptNumber: ''
    });
    const formRef = useRef(null);

    // Using native HTML validation for simple rules; formRef used to report validity on submit.

    useEffect(() => {
        fetchExpenses();
        fetchStats();
    }, []);

    useEffect(() => {
        filterExpenses();
    }, [searchTerm, typeFilter, expenses]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/expenses', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setExpenses(data.data?.expenses || []);
            } else {
                setError('Failed to fetch expenses');
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            setError('Error fetching expenses');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/expenses/stats', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data.data || {});
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const filterExpenses = () => {
        let filtered = expenses;

        if (typeFilter !== 'all') {
            filtered = filtered.filter(expense => expense.expenseType === typeFilter);
        }

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(expense =>
                expense.description?.toLowerCase().includes(searchLower) ||
                expense.expenseId?.toLowerCase().includes(searchLower) ||
                expense.receiptNumber?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredExpenses(filtered);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Basic required field validation
        if (!newExpense.expenseType || !newExpense.description || !newExpense.amount || !newExpense.expenseDate || !newExpense.paymentMethod) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }
        
        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...newExpense,
                    amount: parseFloat(newExpense.amount)
                })
            });

            if (response.ok) {
                setNewExpense({
                    expenseType: '',
                    description: '',
                    amount: '',
                    expenseDate: '',
                    paymentMethod: '',
                    receiptNumber: ''
                });
                setShowAddForm(false);
                fetchExpenses();
                fetchStats();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to add expense');
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            setError('Error adding expense');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (expenseId, updatedData) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/expenses/${expenseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                setEditingExpense(null);
                fetchExpenses();
                fetchStats();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to update expense');
            }
        } catch (error) {
            console.error('Error updating expense:', error);
            setError('Error updating expense');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (expenseId) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/expenses/${expenseId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                fetchExpenses();
                fetchStats();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete expense');
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            setError('Error deleting expense');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return 'LKR ' + (amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 });
    };

    if (loading && expenses.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading expenses...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 min-h-screen" style={{ background: 'linear-gradient(135deg, #b2f5ea 0%, #a7f3d0 100%)' }}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Other Expenses Management</h2>
                <div className="bg-blue-50 rounded-lg shadow p-4 text-sm text-gray-700">
                    {filteredExpenses.length} of {expenses.length} expenses
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Expenses Count</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalExpenses || 0}</p>
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
                            <p className="text-sm font-medium text-gray-600">Total Expenses Amount</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100"> 
                            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Electricity Amount</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.electricityAmount)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-100 border-l-4 border-purple-500 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100">
                            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">This Month</p>
                            <p className="text-2xl font-semibold text-gray-900">{filteredExpenses.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search expenses by description, ID, or receipt number..."
                        value={searchTerm}
                        onChange={(e) => {
                            // Allow only letters, numbers and spaces in search
                            const raw = e.target.value;
                            const sanitized = raw.replace(/[^a-zA-Z0-9\s]/g, '');
                            setSearchTerm(sanitized);
                        }}
                        className="w-full border border-green-400 bg-green-50 text-green-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-500 placeholder-green-700"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border border-blue-400 bg-blue-50 text-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500"
                >
                    <option value="all">All Types</option>
                    <option value="Transport">Transport</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                </select>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    + Add Expense
                </button>
                <button
                    onClick={fetchExpenses}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                    <button 
                        onClick={() => setError('')}
                        className="ml-2 text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Add Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h3 className="text-lg font-medium mb-4">Add New Expense</h3>
                        <form ref={formRef} onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Expense Type *
                                </label>
                                <select
                                    value={newExpense.expenseType}
                                    onChange={(e) => setNewExpense({...newExpense, expenseType: e.target.value})}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Packaging">Packaging</option>
                                    <option value="Miscellaneous">Miscellaneous</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Method *
                                </label>
                                <select
                                    value={newExpense.paymentMethod}
                                    onChange={(e) => setNewExpense({...newExpense, paymentMethod: e.target.value})}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                                    required
                                >
                                    <option value="">Select Method</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Card">Card</option>
                                </select>
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter expense description"
                                    value={newExpense.description}
                                    maxLength={150}
                                    onChange={(e) => {
                                        // Allow letters, numbers, spaces, and common punctuation
                                        const value = e.target.value.slice(0, 150);
                                        setNewExpense({...newExpense, description: value});
                                    }}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount (LKR) *
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={newExpense.amount}
                                    max={999999}
                                    onChange={(e) => {
                                        const value = Math.max(0, Math.min(999999, Number(e.target.value) || 0));
                                        setNewExpense({...newExpense, amount: value});
                                    }}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                                    step="0.01"
                                    min="0.01"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Expense Date *
                                </label>
                                <input
                                    type="date"
                                    value={newExpense.expenseDate}
                                    onChange={(e) => setNewExpense({...newExpense, expenseDate: e.target.value})}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Receipt Number (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter receipt number (Invoice ID, Bank Slip No.)"
                                    value={newExpense.receiptNumber}
                                    maxLength={20}
                                    onChange={(e) => {
                                        // Only alphanumeric characters
                                        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
                                        setNewExpense({...newExpense, receiptNumber: value});
                                    }}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                                />
                            </div>
                            
                            <div className="col-span-2 flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors flex-1"
                                >
                                    {loading ? 'Adding...' : 'Add Expense'}
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
                </div>
            )}

            {/* Edit Expense Modal */}
            {editingExpense && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h3 className="text-lg font-medium mb-4">Edit Expense</h3>
                        
                        {/* Error Display in Modal */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {error}
                                <button 
                                    onClick={() => setError('')}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdate(editingExpense.expenseId || editingExpense._id, editingExpense);
                            }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Expense Type *
                                </label>
                                <select
                                    value={editingExpense.expenseType}
                                    onChange={(e) => setEditingExpense({...editingExpense, expenseType: e.target.value})}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                                    required
                                >
                                    <option value="Transport">Transport</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Packaging">Packaging</option>
                                    <option value="Miscellaneous">Miscellaneous</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Method *
                                </label>
                                <select
                                    value={editingExpense.paymentMethod}
                                    onChange={(e) => setEditingExpense({...editingExpense, paymentMethod: e.target.value})}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                                    required
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Card">Card</option>
                                </select>
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter expense description"
                                    value={editingExpense.description}
                                    maxLength={150}
                                    onChange={(e) => {
                                        const value = e.target.value.slice(0, 150);
                                        setEditingExpense({...editingExpense, description: value});
                                    }}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount (LKR) *
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={editingExpense.amount}
                                    max={999999}
                                    onChange={(e) => {
                                        const value = Math.max(0, Math.min(999999, Number(e.target.value) || 0));
                                        setEditingExpense({...editingExpense, amount: value});
                                    }}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                                    step="0.01"
                                    min="0.01"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Expense Date *
                                </label>
                                <input
                                    type="date"
                                    value={editingExpense.expenseDate ? editingExpense.expenseDate.split('T')[0] : ''}
                                    onChange={(e) => setEditingExpense({...editingExpense, expenseDate: e.target.value})}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Receipt Number (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter receipt number (Invoice ID, Bank Slip No.)"
                                    value={editingExpense.receiptNumber || ''}
                                    maxLength={20}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
                                        setEditingExpense({...editingExpense, receiptNumber: value});
                                    }}
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                                />
                            </div>
                            
                            <div className="col-span-2 flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition-colors flex-1"
                                >
                                    {loading ? 'Updating...' : 'Update Expense'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingExpense(null)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded font-medium transition-colors flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Expenses Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {filteredExpenses.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                        <p className="text-gray-500">
                            {searchTerm || typeFilter !== 'all' 
                                ? 'No expenses found matching your criteria'
                                : 'No expenses available'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Expense ID</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Description</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Payment Method</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Receipt</th>
                                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map((expense, idx) => (
                                    <tr key={expense.expenseId || expense._id} className={idx % 2 === 0 ? "bg-green-50" : "bg-white hover:bg-green-100"}>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{expense.expenseId}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                expense.expenseType === 'Electricity' ? 'bg-yellow-100 text-yellow-800' :
                                                expense.expenseType === 'Transport' ? 'bg-blue-100 text-blue-800' :
                                                expense.expenseType === 'Maintenance' ? 'bg-red-100 text-red-800' :
                                                expense.expenseType === 'Packaging' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {expense.expenseType}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2 text-sm text-gray-900 max-w-xs truncate">{expense.description}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(expense.expenseDate).toLocaleDateString()}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">{expense.paymentMethod}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">{expense.receiptNumber || '-'}</td>
                                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => setEditingExpense(expense)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-medium transition-colors shadow-sm mr-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(expense.expenseId || expense._id)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-medium transition-colors shadow-sm"
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
        </div>
    );
};

export default OtherExpensesView;