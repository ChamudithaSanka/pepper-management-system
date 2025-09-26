import express from 'express';
import {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
    getEmployeeStats
} from '../controllers/employeeController.js';

const router = express.Router();

// @route   GET /api/employees
// @desc    Get all employees with optional filtering
// @access  Private (Admin)
router.get('/', getAllEmployees);

// @route   GET /api/employees/stats
// @desc    Get employee statistics
// @access  Private (Admin)
router.get('/stats', getEmployeeStats);

// @route   GET /api/employees/:id
// @desc    Get single employee by ID
// @access  Private (Admin)
router.get('/:id', getEmployeeById);

// @route   POST /api/employees
// @desc    Create new employee
// @access  Private (Admin)
router.post('/', createEmployee);

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private (Admin)
router.put('/:id', updateEmployee);

// @route   PUT /api/employees/:id/toggle-status
// @desc    Toggle employee status (Active/Inactive)
// @access  Private (Admin)
router.put('/:id/toggle-status', toggleEmployeeStatus);

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private (Admin)
router.delete('/:id', deleteEmployee);

export default router;