import Salary from '../models/salaryModel.js';
import Employee from '../models/employeeModel.js';

// Helper function to calculate salary breakdown
const calculateSalaryBreakdown = (employee, attendanceData, allowances, deductions) => {
    const basicSalary = employee.basicSalary || 0;
    const perDaySalary = basicSalary / 28;
    const hourlyRate = perDaySalary / 8;

    // Calculate deductions
    const noPayAmount = (attendanceData.noPayDays || 0) * perDaySalary;
    const epfEmployee = basicSalary * 0.08; // 8% - deducted from employee
    const epfCompany = basicSalary * 0.12; // 12% - company contribution (not deducted)
    const etfCompany = basicSalary * 0.03; // 3% - company contribution (not deducted)
    
    // Calculate allowances
    const otPay = (attendanceData.otHours || 0) * hourlyRate * 1.5; // 1.5x for OT
    
    const totalAllowances = 
        (allowances.foodAllowance || 0) +
        (allowances.medicalAllowance || 0) +
        (allowances.bonus || 0) +
        otPay;
    
    const totalDeductions = 
        noPayAmount +
        epfEmployee +
        (deductions.loans || 0) +
        (deductions.advances || 0);
    
    const grossSalary = basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    return {
        basicSalary,
        perDaySalary: parseFloat(perDaySalary.toFixed(2)),
        hourlyRate: parseFloat(hourlyRate.toFixed(2)),
        breakdown: {
            allowances: {
                foodAllowance: allowances.foodAllowance || 0,
                medicalAllowance: allowances.medicalAllowance || 0,
                bonus: allowances.bonus || 0,
                otPay: parseFloat(otPay.toFixed(2))
            },
            deductions: {
                noPayAmount: parseFloat(noPayAmount.toFixed(2)),
                epfEmployee: parseFloat(epfEmployee.toFixed(2)),
                loans: deductions.loans || 0,
                advances: deductions.advances || 0
            },
            companyContributions: {
                epfCompany: parseFloat(epfCompany.toFixed(2)),
                etfCompany: parseFloat(etfCompany.toFixed(2))
            }
        },
        totalAllowances: parseFloat(totalAllowances.toFixed(2)),
        totalDeductions: parseFloat(totalDeductions.toFixed(2)),
        grossSalary: parseFloat(grossSalary.toFixed(2)),
        netSalary: parseFloat(netSalary.toFixed(2))
    };
};

// CALCULATE SALARY - For preview/calculation only
export const calculateSalary = async (req, res) => {
    try {
        const { 
            employeeId, 
            attendanceData, 
            allowances = {}, 
            deductions = {} 
        } = req.body;

        // Validate required fields
        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID is required'
            });
        }

        // Find employee
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Validate attendance data
        if (!attendanceData || !attendanceData.month || !attendanceData.workingDays) {
            return res.status(400).json({
                success: false,
                message: 'Attendance data (month, workingDays) is required'
            });
        }

        // Calculate salary
        const salaryCalculation = calculateSalaryBreakdown(
            employee, 
            attendanceData, 
            allowances, 
            deductions
        );

        res.status(200).json({
            success: true,
            message: 'Salary calculated successfully',
            data: {
                employee: {
                    employeeId: employee.employeeId,
                    name: employee.name,
                    designation: employee.designation,
                    basicSalary: employee.basicSalary
                },
                attendanceData,
                calculation: salaryCalculation
            }
        });

    } catch (error) {
        console.error('Error calculating salary:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating salary',
            error: error.message
        });
    }
};

// SAVE SALARY RECORD
export const saveSalary = async (req, res) => {
    try {
        const { 
            employeeId, 
            month, 
            year, 
            attendanceData, 
            allowances = {}, 
            deductions = {} 
        } = req.body;

        // Validate required fields
        if (!employeeId || !month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID, month, and year are required'
            });
        }

        // Find employee
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Check if salary already exists for this month/year
        const existingSalary = await Salary.findOne({
            employeeId,
            month,
            year
        });

        if (existingSalary) {
            return res.status(400).json({
                success: false,
                message: `Salary for ${month}/${year} already exists for this employee`
            });
        }

        // Calculate salary
        const salaryCalculation = calculateSalaryBreakdown(
            employee, 
            attendanceData, 
            allowances, 
            deductions
        );

        // Create salary record
        const salary = new Salary({
            employeeId,
            employeeName: employee.name,
            designation: employee.designation,
            month,
            year,
            basicSalary: employee.basicSalary,
            attendanceData: {
                workingDays: attendanceData.workingDays,
                otHours: attendanceData.otHours || 0,
                noPayDays: attendanceData.noPayDays || 0
            },
            allowances: salaryCalculation.breakdown.allowances,
            deductions: salaryCalculation.breakdown.deductions,
            companyContributions: salaryCalculation.breakdown.companyContributions,
            totalAllowances: salaryCalculation.totalAllowances,
            totalDeductions: salaryCalculation.totalDeductions,
            grossSalary: salaryCalculation.grossSalary,
            netSalary: salaryCalculation.netSalary
        });

        await salary.save();

        res.status(201).json({
            success: true,
            message: 'Salary saved successfully',
            data: salary
        });

    } catch (error) {
        console.error('Error saving salary:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving salary',
            error: error.message
        });
    }
};

// GET ALL SALARIES
export const getAllSalaries = async (req, res) => {
    try {
        const { month, year, employeeId } = req.query;
        
        let filter = {};
        if (month) filter.month = parseInt(month);
        if (year) filter.year = parseInt(year);
        if (employeeId) filter.employeeId = employeeId;

        const salaries = await Salary.find(filter)
            .sort({ year: -1, month: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            data: salaries,
            count: salaries.length
        });

    } catch (error) {
        console.error('Error fetching salaries:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching salaries',
            error: error.message
        });
    }
};

// GET SALARY BY ID
export const getSalaryById = async (req, res) => {
    try {
        const { id } = req.params;

        const salary = await Salary.findById(id);
        if (!salary) {
            return res.status(404).json({
                success: false,
                message: 'Salary record not found'
            });
        }

        res.status(200).json({
            success: true,
            data: salary
        });

    } catch (error) {
        console.error('Error fetching salary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching salary',
            error: error.message
        });
    }
};

// UPDATE SALARY RECORD
export const updateSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove any fields that shouldn't be updated directly
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const salary = await Salary.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!salary) {
            return res.status(404).json({
                success: false,
                message: 'Salary record not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Salary updated successfully',
            data: salary
        });

    } catch (error) {
        console.error('Error updating salary:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating salary',
            error: error.message
        });
    }
};

// DELETE SALARY RECORD
export const deleteSalary = async (req, res) => {
    try {
        const { id } = req.params;

        const salary = await Salary.findById(id);
        if (!salary) {
            return res.status(404).json({
                success: false,
                message: 'Salary record not found'
            });
        }

        // Allow deletion of any salary record

        await Salary.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Salary record deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting salary:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting salary',
            error: error.message
        });
    }
};

// GET SALARY STATISTICS
export const getSalaryStats = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;

        const stats = await Salary.aggregate([
            { $match: { year: parseInt(year) } },
            {
                $group: {
                    _id: null,
                    totalSalaries: { $sum: 1 },
                    totalNetPay: { $sum: '$netSalary' },
                    totalGrossPay: { $sum: '$grossSalary' },
                    totalEPF: { $sum: '$companyContributions.epfCompany' },
                    totalETF: { $sum: '$companyContributions.etfCompany' },
                    averageNetSalary: { $avg: '$netSalary' },
                    averageGrossSalary: { $avg: '$grossSalary' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats[0] || {
                totalSalaries: 0,
                totalNetPay: 0,
                totalGrossPay: 0,
                totalEPF: 0,
                totalETF: 0,
                approvedCount: 0,
                paidCount: 0
            }
        });

    } catch (error) {
        console.error('Error fetching salary stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching salary statistics',
            error: error.message
        });
    }
};