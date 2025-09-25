import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        index: true
    },
    employeeName: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    basicSalary: {
        type: Number,
        required: true
    },
    attendanceData: {
        workingDays: {
            type: Number,
            required: true,
            min: 0,
            max: 31
        },
        otHours: {
            type: Number,
            default: 0,
            min: 0
        },
        noPayDays: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    allowances: {
        foodAllowance: {
            type: Number,
            default: 0
        },
        medicalAllowance: {
            type: Number,
            default: 0
        },
        bonus: {
            type: Number,
            default: 0
        },
        otPay: {
            type: Number,
            default: 0
        }
    },
    deductions: {
        noPayAmount: {
            type: Number,
            default: 0
        },
        epfEmployee: {
            type: Number,
            default: 0
        },
        loans: {
            type: Number,
            default: 0
        },
        advances: {
            type: Number,
            default: 0
        }
    },
    companyContributions: {
        epfCompany: {
            type: Number,
            default: 0
        },
        etfCompany: {
            type: Number,
            default: 0
        }
    },
    totalAllowances: {
        type: Number,
        required: true
    },
    totalDeductions: {
        type: Number,
        required: true
    },
    grossSalary: {
        type: Number,
        required: true
    },
    netSalary: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Compound index for unique salary per employee per month/year
salarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

// Index for querying by status
salarySchema.index({ status: 1 });

// Index for date range queries
salarySchema.index({ year: 1, month: 1 });

const Salary = mongoose.model('Salary', salarySchema);

export default Salary;