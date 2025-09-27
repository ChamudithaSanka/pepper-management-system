import React, { useState, useEffect } from 'react';

const DeliveriesView = ({ onStatsUpdate }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchDeliveryTasks();
    }, []);

    const fetchDeliveryTasks = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/delivery/tasks', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Delivery tasks data:', data.data.tasks);
                setTasks(data.data.tasks || []);
            } else {
                setError('Failed to fetch delivery tasks');
            }
        } catch (error) {
            console.error('Error fetching delivery tasks:', error);
            setError('Error fetching delivery tasks');
        } finally {
            setLoading(false);
        }
    };

    const markTaskCompleted = async (taskId) => {
        try {
            // Find the task to get the orderId
            const task = tasks.find(t => t._id === taskId);
            if (!task) {
                alert('Task not found');
                return;
            }

            // Update delivery task status
            const taskResponse = await fetch(`/api/delivery/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ status: 'Delivered' })
            });

            if (!taskResponse.ok) {
                const taskError = await taskResponse.json();
                alert(taskError.message || 'Failed to mark task as completed');
                return;
            }

            // Update order status to delivered
            const orderResponse = await fetch(`/api/orders/${task.orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    orderStatus: 'Delivered',
                    paymentStatus: 'Completed'
                })
            });

            if (!orderResponse.ok) {
                const orderError = await orderResponse.json();
                alert(orderError.message || 'Task completed but failed to update order status');
            }

            // Refresh data and show success message
            fetchDeliveryTasks();
            if (onStatsUpdate) onStatsUpdate();
            alert('Delivery task and order marked as completed successfully!');

        } catch (error) {
            console.error('Error marking task as completed:', error);
            alert('Error marking task as completed');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Assigned':
                return 'bg-blue-100 text-blue-800';
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'Assigned':
                return 'In Progress';
            default:
                return status;
        }
    };

    const filteredTasks = tasks.filter(task => {
        return filterStatus === 'all' || task.status === filterStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Active Delivery Tasks</h2>
                    <p className="text-gray-600 mt-1">Track and manage delivery tasks</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={fetchDeliveryTasks}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
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

            {/* Filters */}
            <div className="bg-white border border-green-700 rounded-lg p-4">
                <div className="flex items-center space-x-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border border-green-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700 bg-gray-50 text-gray-900"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Assigned">In Progress</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading delivery tasks...</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707L15 6.586A1 1 0 0014.414 6H14v1z"/>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No delivery tasks found</h3>
                        <p className="text-gray-500">
                            {filterStatus === 'all' 
                                ? 'No delivery tasks available'
                                : `No ${filterStatus.toLowerCase()} delivery tasks found`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Task ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Driver</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Pickup Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Delivery Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Assigned Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Completed Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTasks.map((task) => (
                                    <tr key={task._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.taskId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <a href={`/orders/${task.orderId}`} className="text-blue-600 hover:text-blue-800 underline">{task.orderId}</a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {task.status === 'Pending' ? (
                                                <span className="text-gray-400">Not assigned</span>
                                            ) : (
                                                <div>
                                                    <div className="font-medium">{task.driverName}</div>
                                                    <div className="text-gray-500">{task.driverId?.vehicleNumber || 'Vehicle info not available'}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><div className="max-w-xs truncate">{task.pickupLocation?.address || 'Shop location'}</div></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><div className="max-w-xs truncate">{task.deliveryLocation?.address || 'No address available'}</div></td>
                                        <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>{getStatusLabel(task.status)}</span></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.assignedAt ? new Date(task.assignedAt).toLocaleDateString() : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.deliveredAt ? new Date(task.deliveredAt).toLocaleDateString() : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {task.status === 'Assigned' ? (
                                                <button onClick={() => markTaskCompleted(task._id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">Mark as Completed</button>
                                            ) : task.status === 'Delivered' ? (
                                                <span className="text-green-600 font-medium">✓ Completed</span>
                                            ) : (
                                                <span className="text-gray-400">No actions</span>
                                            )}
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

export default DeliveriesView;
