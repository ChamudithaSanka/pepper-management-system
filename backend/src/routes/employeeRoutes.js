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
router.get('/', getAllEmployees);
router.get('/stats', getEmployeeStats);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.put('/:id/toggle-status', toggleEmployeeStatus);
router.delete('/:id', deleteEmployee);

export default router;