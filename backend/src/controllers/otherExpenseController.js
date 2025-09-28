import OtherExpense from '../models/otherExpenseModel.js';

// CREATE EXPENSE
export const createExpense = async (req, res) => {
    try {
        const {
            expenseType,
            description,
            amount,
            expenseDate,
            paymentMethod,
            receiptNumber
        } = req.body;

        // Get user info from request (assuming it's set by auth middleware)
        const createdBy = req.user?.name || 'System';

        // Create new expense
        const expense = new OtherExpense({
            expenseType,
            description,
            amount,
            expenseDate,
            paymentMethod,
            receiptNumber,
            createdBy
        });

        await expense.save();

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: expense.getFormattedData()
        });

    } catch (error) {
        console.error('Error creating expense:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating expense',
            error: error.message
        });
    }
};

// GET ALL EXPENSES
export const getAllExpenses = async (req, res) => {
    try {
        const { 
            type, 
            paymentMethod, 
            status = 'Active',
            page = 1, 
            limit = 20,
            startDate,
            endDate,
            search
        } = req.query;

        // Build query
        const query = { status };
        
        if (type) query.expenseType = type;
        if (paymentMethod) query.paymentMethod = paymentMethod;
        
        if (startDate || endDate) {
            query.expenseDate = {};
            if (startDate) query.expenseDate.$gte = new Date(startDate);
            if (endDate) query.expenseDate.$lte = new Date(endDate);
        }

        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { expenseId: { $regex: search, $options: 'i' } },
                { receiptNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        const expenses = await OtherExpense.find(query)
            .sort({ expenseDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalExpenses = await OtherExpense.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                expenses: expenses.map(expense => expense.getFormattedData()),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalExpenses / limit),
                    totalExpenses,
                    hasNext: page * limit < totalExpenses,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching expenses',
            error: error.message
        });
    }
};

// GET EXPENSE BY ID
export const getExpenseById = async (req, res) => {
    try {
        const { expenseId } = req.params;

        if (!expenseId) {
            return res.status(400).json({ success: false, message: 'Missing expenseId' });
        }

        const expense = await OtherExpense.findOne({ expenseId });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            data: expense.getFormattedData()
        });

    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching expense',
            error: error.message
        });
    }
};

// UPDATE EXPENSE
export const updateExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;
        const updateData = req.body;

        if (!expenseId) {
            return res.status(400).json({ success: false, message: 'Missing expenseId' });
        }

        const expense = await OtherExpense.findOne({ expenseId });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Update fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                expense[key] = updateData[key];
            }
        });

        await expense.save();

        res.status(200).json({
            success: true,
            message: 'Expense updated successfully',
            data: expense.getFormattedData()
        });

    } catch (error) {
        console.error('Error updating expense:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating expense',
            error: error.message
        });
    }
};

// DELETE EXPENSE
export const deleteExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;

        if (!expenseId) {
            return res.status(400).json({ success: false, message: 'Missing expenseId' });
        }

        const expense = await OtherExpense.findOne({ expenseId });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Soft delete by changing status
        expense.status = 'Inactive';
        await expense.save();

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting expense',
            error: error.message
        });
    }
};

// GET EXPENSE STATISTICS
export const getExpenseStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            if (startDate) dateFilter.$gte = new Date(startDate);
            if (endDate) dateFilter.$lte = new Date(endDate);
        }

        const matchStage = { status: 'Active' };
        if (Object.keys(dateFilter).length > 0) {
            matchStage.expenseDate = dateFilter;
        }

        // Get total expenses count
        const totalExpenses = await OtherExpense.countDocuments(matchStage);

        // Get total amount
        const totalAmountResult = await OtherExpense.aggregate([
            { $match: matchStage },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

        // Get electricity amount
        const electricityResult = await OtherExpense.aggregate([
            { 
                $match: { 
                    ...matchStage,
                    expenseType: 'Electricity'
                } 
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const electricityAmount = electricityResult.length > 0 ? electricityResult[0].total : 0;

        // Get expenses by type
        const expensesByType = await OtherExpense.aggregate([
            { $match: matchStage },
            { 
                $group: { 
                    _id: '$expenseType', 
                    count: { $sum: 1 },
                    total: { $sum: '$amount' }
                } 
            },
            { $sort: { total: -1 } }
        ]);

        // Get recent expenses
        const recentExpenses = await OtherExpense.find(matchStage)
            .sort({ expenseDate: -1, createdAt: -1 })
            .limit(5)
            .select('expenseId expenseType description amount expenseDate');

        res.status(200).json({
            success: true,
            data: {
                totalExpenses,
                totalAmount,
                electricityAmount,
                expensesByType,
                recentExpenses
            }
        });

    } catch (error) {
        console.error('Error fetching expense statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching expense statistics',
            error: error.message
        });
    }
};

// GET EXPENSES BY TYPE
export const getExpensesByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { startDate, endDate } = req.query;

        const query = { 
            expenseType: type,
            status: 'Active'
        };

        if (startDate || endDate) {
            query.expenseDate = {};
            if (startDate) query.expenseDate.$gte = new Date(startDate);
            if (endDate) query.expenseDate.$lte = new Date(endDate);
        }

        const expenses = await OtherExpense.find(query)
            .sort({ expenseDate: -1 });

        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        res.status(200).json({
            success: true,
            data: {
                expenses: expenses.map(expense => expense.getFormattedData()),
                totalAmount,
                count: expenses.length
            }
        });

    } catch (error) {
        console.error('Error fetching expenses by type:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching expenses by type',
            error: error.message
        });
    }
};
