import Employee from '../models/employeeModel.js';

// Generate unique employee ID
const generateEmployeeId = async () => {
    const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });
    if (!lastEmployee) {
        return 'EMP001';
    }
    
    const lastId = lastEmployee.employeeId;
    const number = parseInt(lastId.replace('EMP', '')) + 1;
    return `EMP${number.toString().padStart(3, '0')}`;
};

// Get all employees
const getAllEmployees = async (req, res) => {
    try {
        const { status, search } = req.query;
        
        let query = {};
        
        // Filter by status if provided
        if (status && status !== 'all') {
            query.status = status;
        }
        
        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } },
                { epfNo: { $regex: search, $options: 'i' } }
            ];
        }
        
        const employees = await Employee.find(query).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: employees,
            count: employees.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employees',
            error: error.message
        });
    }
};

// Get single employee by ID
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee',
            error: error.message
        });
    }
};

// Create new employee
const createEmployee = async (req, res) => {
    try {
        const { name, designation, basicSalary, epfNo } = req.body;
        
        // Generate employee ID if not provided
        const employeeId = await generateEmployeeId();
        
        // Use provided EPF number or default to employee ID
        const finalEpfNo = epfNo || employeeId;
        
        const employee = new Employee({
            employeeId,
            name,
            designation,
            basicSalary,
            epfNo: finalEpfNo
        });
        
        await employee.save();
        
        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }
        
        res.status(400).json({
            success: false,
            message: 'Failed to create employee',
            error: error.message
        });
    }
};

// Update employee
const updateEmployee = async (req, res) => {
    try {
        const { name, designation, basicSalary, epfNo, status } = req.body;
        
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            {
                name,
                designation,
                basicSalary,
                epfNo,
                status
            },
            { new: true, runValidators: true }
        );
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: employee
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }
        
        res.status(400).json({
            success: false,
            message: 'Failed to update employee',
            error: error.message
        });
    }
};

// Delete employee
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete employee',
            error: error.message
        });
    }
};

// Toggle employee status (activate/deactivate)
const toggleEmployeeStatus = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        employee.status = employee.status === 'Active' ? 'Inactive' : 'Active';
        await employee.save();
        
        res.status(200).json({
            success: true,
            message: `Employee ${employee.status.toLowerCase()} successfully`,
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update employee status',
            error: error.message
        });
    }
};

// Get employees statistics
const getEmployeeStats = async (req, res) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        const activeEmployees = await Employee.countDocuments({ status: 'Active' });
        const inactiveEmployees = await Employee.countDocuments({ status: 'Inactive' });
        
        // Calculate total salary cost (active employees only)
        const activeEmployeesData = await Employee.find({ status: 'Active' });
        const totalSalaryCost = activeEmployeesData.reduce((sum, emp) => sum + emp.basicSalary, 0);
        
        // Group by designation
        const designationStats = await Employee.aggregate([
            {
                $group: {
                    _id: '$designation',
                    count: { $sum: 1 },
                    totalSalary: { $sum: '$basicSalary' }
                }
            },
            { $sort: { count: -1 } }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                totalEmployees,
                activeEmployees,
                inactiveEmployees,
                totalSalaryCost,
                designationStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee statistics',
            error: error.message
        });
    }
};

export {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
    getEmployeeStats
};