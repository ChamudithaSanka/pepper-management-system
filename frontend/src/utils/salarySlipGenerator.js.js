import jsPDF from 'jspdf';

// Company details - you can modify these as needed
const COMPANY_DETAILS = {
  name: 'CeylonPepper',
  address: '255A, Welivita, Malabe',
  phone: '+94 11 234 5678',
  email: 'info@ceylonpepper.com',
  website: 'www.ceylonpepper.com'
};

export const generateSalarySlipPDF = async (salaryData, employeeData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const primaryColor = [34, 197, 94]; // Green
  const darkColor = [31, 41, 55]; // Dark gray
  const lightGray = [243, 244, 246]; // Light gray

  // Helper function to add logo
  const addLogo = async () => {
    try {
      // Try to load the logo image
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        logoImg.onload = () => {
          // Add logo image (40x40 pixels) in top right
          doc.addImage(logoImg, 'PNG', 15, 15, 20, 20);

          
          // Add company name next to logo
          doc.setFontSize(20);
          doc.setTextColor(...primaryColor);
          doc.setFont('helvetica', 'bold');
          doc.text(COMPANY_DETAILS.name, 38, 22);
          
          resolve();
        };
        
        logoImg.onerror = () => {
          // Fallback to text logo if image fails to load
          doc.setFontSize(20);
          doc.setTextColor(...primaryColor);
          doc.setFont('helvetica', 'bold');
          doc.text(COMPANY_DETAILS.name, pageWidth - 80, 30);
          
          resolve();
        };
        
        logoImg.src = '/images/logo1.png';
      });
    } catch (error) {
      // Fallback to text logo
      doc.setFontSize();
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(COMPANY_DETAILS.name, pageWidth - 80, 24);
    }
  };

  // Helper function to add company details
  const addCompanyDetails = () => {
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');

    // Add company address and phone number
    doc.text(COMPANY_DETAILS.address, 40, 28);
    doc.text(COMPANY_DETAILS.phone, 40, 34);
  };

  // Helper function to add salary slip header
  const addSalarySlipHeader = () => {
    // Add "Pay Slip" title in top right
    doc.setFontSize(14);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Pay Slip For', pageWidth - 30, 25, { align: 'right' });
    
    // Add month/year
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[salaryData.month - 1] || 'Unknown';
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${monthName} ${salaryData.year}`, pageWidth - 30, 32, { align: 'right' });
  };

  // Helper function to add employee details
  const addEmployeeDetails = () => {
    const startY = 50;
    
    // Add title
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Information', 25, startY + 8);
    
    // Add employee details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const details = [
      { label: 'ID:', value: salaryData.employeeId },
      { label: 'Name:', value: salaryData.employeeName },
      { label: 'Designation:', value: salaryData.designation },
      { label: 'EPF No:', value: salaryData.employeeId }
    ];
    
    details.forEach((detail, index) => {
      const y = startY + 15 + (index * 6);
      doc.text(detail.label, 25, y);
      doc.setFont('helvetica', 'bold');
      doc.text(detail.value.toString(), 25 + 25, y);
      doc.setFont('helvetica', 'normal');
    });
  };

  // Helper function to add attendance
  const addAttendance = () => {
    const startY = 50;
    
    // Add title
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Attendance', 115, startY + 8);
    
    // Add attendance details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[salaryData.month - 1] || 'Unknown';
    
    const details = [
      { label: 'Month:', value: monthName },
      { label: 'Working Days:', value: salaryData.attendanceData.workingDays || 0.00 },
      { label: 'Overtime Hours:', value: salaryData.attendanceData.otHours ||0.00 },
      { label: 'No Pay Days:', value: salaryData.attendanceData.noPayDays || 0.00 }
    ];
    
    details.forEach((detail, index) => {
      const y = startY + 15 + (index * 6);
      doc.text(detail.label, 115, y);
      doc.setFont('helvetica', 'bold');
      doc.text(detail.value.toString(), 115 + 30, y);
      doc.setFont('helvetica', 'normal');
    });
  };

  // Helper function to add allowances
  const addAllowances = () => {
    const startY = 105;
    
    // Add title
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Allowances', 25, startY + 8);
    
    // Add allowances
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const allowances = [
      { label: 'Food:', value: salaryData.allowances.foodAllowance || 0.00 },
      { label: 'Medical:', value: salaryData.allowances.medicalAllowance || 0.00 },
      { label: 'Overtime:', value: salaryData.allowances.otPay || 0.00 },
      { label: 'Bonus:', value: salaryData.allowances.bonus || 0.00 }
    ];
    
    allowances.forEach((allowance, index) => {
      const y = startY + 15 + (index * 7);
      doc.text(allowance.label, 25, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`LKR ${allowance.value.toFixed(2)}`, 25 + 25, y);
      doc.setFont('helvetica', 'normal');
    });
  };

  // Helper function to add deductions
  const addDeductions = () => {
    const startY = 105;
    
    // Add title
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Deductions', 115, startY + 8);
    
    // Add deductions
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const deductions = [
      { label: 'No Pay:', value: salaryData.deductions.noPayAmount || 0.00 },
      { label: 'EPF (Employee 8%):', value: salaryData.deductions.epfEmployee || 0.00 },
      { label: 'ETF (Employer 3%):', value: salaryData.companyContributions.etfCompany || 0.00 },
      { label: 'Loans:', value: salaryData.deductions.loans || 0.00 }
    ];
    
    deductions.forEach((deduction, index) => {
      const y = startY + 15 + (index * 7);
      doc.text(deduction.label, 115, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`LKR ${deduction.value.toFixed(2)}`, 115 + 35, y);
      doc.setFont('helvetica', 'normal');
    });
  };

  // Helper function to add summary
  const addSummary = () => {
    const startY = 150;
    const boxWidth = 40;
    const gap = 5;
    
    const boxes = [
      { label: 'Basic', value: salaryData.basicSalary || 0, color: darkColor },
      { label: 'Total Allowances', value: salaryData.totalAllowances || 0.00, color: [59, 130, 246] }, // Blue
      { label: 'Total Deductions', value: salaryData.totalDeductions || 0.00, color: [239, 68, 68] }, // Red
      { label: 'Net Salary', value: salaryData.netSalary || 0.00, color: primaryColor } // Green
    ];
    
    boxes.forEach((box, index) => {
      const x = 20 + (index * (boxWidth + gap));
      
      // Add label
      doc.setFontSize(10);
      doc.setTextColor(...darkColor);
      doc.setFont('helvetica', 'bold');
      doc.text(box.label, x + 2, startY + 8);
      
      // Add value
      doc.setFontSize(12);
      doc.setTextColor(...box.color);
      doc.setFont('helvetica', 'bold');
      doc.text(`LKR ${box.value.toFixed(2)}`, x + 2, startY + 20);
    });
  };

  // Helper function to add footer
  const addFooter = () => {
  const footerY = pageHeight - 100;

  // Add signature line above text
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(25, footerY - 6, 80, footerY - 6);

  // Add text
  doc.setFontSize(12);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Signature', 25, footerY);
};

  // Generate the PDF
  try {
    await addLogo();
    addCompanyDetails();
    addSalarySlipHeader();
    addEmployeeDetails();
    addAttendance();
    addAllowances();
    addDeductions();
    addSummary();
    addFooter();
    
    // Save the PDF
    const fileName = `Salary_Slip_${salaryData.employeeId}_${salaryData.month}_${salaryData.year}.pdf`;
    const pdfBlob = doc.output('bloburl');
    window.open(pdfBlob);
    //doc.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};
