import express from 'express';
import {
    createExpense,
    getAllExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpenseStats,
    getExpensesByType
} from '../controllers/otherExpenseController.js';

const router = express.Router();

// Create expense
router.post('/', createExpense);

// Get all expenses with filters and pagination
router.get('/', getAllExpenses);

// Get expense statistics
router.get('/stats', getExpenseStats);

// Get expenses by type
router.get('/type/:type', getExpensesByType);

// Get expense by expenseId
router.get('/:expenseId', getExpenseById);

// Update expense by expenseId
router.put('/:expenseId', updateExpense);

// Delete expense by expenseId (soft delete)
router.delete('/:expenseId', deleteExpense);

export default router;
