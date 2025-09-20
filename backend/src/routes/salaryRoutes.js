import express from 'express';
import {
    calculateSalary,
    saveSalary,
    getAllSalaries,
    getSalaryById,
    updateSalaryStatus,
    deleteSalary,
    getSalaryStats
} from '../controllers/salaryController.js';

const router = express.Router();

// POST /api/salaries/calculate - Calculate salary (preview only)
router.post('/calculate', calculateSalary);

// POST /api/salaries - Save salary record
router.post('/', saveSalary);

// GET /api/salaries - Get all salaries with filters
router.get('/', getAllSalaries);

// GET /api/salaries/stats - Get salary statistics
router.get('/stats', getSalaryStats);

// GET /api/salaries/:id - Get salary by ID
router.get('/:id', getSalaryById);

// PUT /api/salaries/:id/status - Update salary status (approve/reject/paid)
router.put('/:id/status', updateSalaryStatus);

// DELETE /api/salaries/:id - Delete salary record
router.delete('/:id', deleteSalary);

export default router;