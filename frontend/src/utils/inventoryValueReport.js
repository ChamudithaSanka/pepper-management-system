import jsPDF from 'jspdf';

// Company details
const COMPANY_DETAILS = {
  name: 'CeylonPepper',
  address: '255A, Welivita, Malabe',
  phone: '+94 11 234 5678',
  email: 'info@ceylonpepper.com',
  website: 'www.ceylonpepper.com'
};

export const generateInventoryValueReport = async (products) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const primaryColor = [34, 197, 94]; // Green
  const darkColor = [31, 41, 55]; // Dark gray
  const lightGray = [243, 244, 246]; // Light gray
  const headerColor = [59, 130, 246]; // Blue

  // Helper function to add logo and header
  const addHeader = async () => {
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        logoImg.onload = () => {
          doc.addImage(logoImg, 'PNG', 15, 20, 20, 20);
          doc.setFontSize(20);
          doc.setTextColor(...primaryColor);
          doc.setFont('helvetica', 'bold');
          doc.text(COMPANY_DETAILS.name, 38, 22);
          resolve();
        };
        
        logoImg.onerror = () => {
          doc.setFontSize(20);
          doc.setTextColor(...primaryColor);
          doc.setFont('helvetica', 'bold');
          doc.text(COMPANY_DETAILS.name, 20, 24);
          resolve();
        };
        
        logoImg.src = '/images/logo1.png';
      });
    } catch (error) {
      doc.setFontSize(20);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(COMPANY_DETAILS.name, 20, 24);
    }
  };

  // Helper function to add company details
  const addCompanyDetails = () => {
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'normal');
    doc.text(COMPANY_DETAILS.address, 40, 28);
    doc.text(COMPANY_DETAILS.phone, 40, 34);
    doc.text(COMPANY_DETAILS.email, 40, 40);
  };

  // Helper function to add report title
  const addReportTitle = () => {
    doc.setFontSize(18);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Inventory Value Report', 20, 60);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 30, 60, { align: 'right' });
  };

  // Calculate category values
  const calculateCategoryValues = () => {
    const categoryData = {};
    let totalInventoryValue = 0;

    products.forEach(product => {
      if (product.status === 'Active') {
        const category = product.category || 'Uncategorized';
        const value = product.currentStock * product.price;
        
        if (!categoryData[category]) {
          categoryData[category] = {
            totalQuantity: 0,
            totalValue: 0,
            averagePrice: 0,
            productCount: 0
          };
        }
        
        categoryData[category].totalQuantity += product.currentStock;
        categoryData[category].totalValue += value;
        categoryData[category].productCount += 1;
        totalInventoryValue += value;
      }
    });

    // Calculate average prices
    Object.keys(categoryData).forEach(category => {
      categoryData[category].averagePrice = 
        categoryData[category].totalValue / categoryData[category].totalQuantity;
    });

    return { categoryData, totalInventoryValue };
  };

  // Helper function to add category breakdown table
  const addCategoryTable = (categoryData, totalInventoryValue) => {
    const startY = 80;
    let currentY = startY;

    // Table header
    doc.setFillColor(...headerColor);
    doc.rect(20, currentY, pageWidth - 40, 12, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Category', 25, currentY + 8);
    doc.text('Quantity', 80, currentY + 8);
    doc.text('Avg Price', 120, currentY + 8);
    doc.text('Total Value', 160, currentY + 8);
 

    currentY += 15;

    // Table rows
    const sortedCategories = Object.entries(categoryData)
      .sort(([,a], [,b]) => b.totalValue - a.totalValue);

    sortedCategories.forEach(([category, data], index) => {
      const percentage = ((data.totalValue / totalInventoryValue) * 100).toFixed(1);
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(...lightGray);
        doc.rect(20, currentY - 3, pageWidth - 40, 10, 'F');
      }

      doc.setFontSize(9);
      doc.setTextColor(...darkColor);
      doc.setFont('helvetica', 'normal');
      
      // Category name (truncate if too long)
      const categoryName = category.length > 15 ? category.substring(0, 15) + '...' : category;
      doc.text(categoryName, 25, currentY + 3);
      
      // Quantity
      doc.text(data.totalQuantity.toString(), 80, currentY + 3);
      
      // Average price
      doc.text(`LKR ${data.averagePrice.toFixed(2)}`, 120, currentY + 3);
      
      // Total value
      doc.text(`LKR ${data.totalValue.toFixed(2)}`, 160, currentY + 3);

      currentY += 12;
    });

    return currentY;
  };

  // Helper function to add summary
  const addSummary = (startY, totalInventoryValue, categoryData) => {
    const summaryY = startY + 20;
    
    // Summary box
    doc.setFillColor(...lightGray);
    doc.rect(20, summaryY, pageWidth - 40, 30, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 25, summaryY + 8);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Categories: ${Object.keys(categoryData).length}`, 25, summaryY + 16);
    doc.text(`Total Products: ${products.filter(p => p.status === 'Active').length}`, 25, summaryY + 22);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Inventory Value: LKR ${totalInventoryValue.toFixed(2)}`, pageWidth - 30, summaryY + 16, { align: 'right' });
    
    const totalQuantity = Object.values(categoryData).reduce((sum, data) => sum + data.totalQuantity, 0);
    doc.text(`Total Quantity: ${totalQuantity} units`, pageWidth - 30, summaryY + 22, { align: 'right' });
  };

  // Helper function to add footer
  const addFooter = () => {
    const footerY = pageHeight - 20;
    
    doc.setFontSize(8);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'normal');
    doc.text('This report was generated automatically by CeylonPepper Inventory Management System', 20, footerY);
    doc.text(`Page 1 of 1`, pageWidth - 20, footerY, { align: 'right' });
  };

  // Generate the PDF
  try {
    await addHeader();
    addCompanyDetails();
    addReportTitle();
    
    const { categoryData, totalInventoryValue } = calculateCategoryValues();
    const tableEndY = addCategoryTable(categoryData, totalInventoryValue);
    addSummary(tableEndY, totalInventoryValue, categoryData);
    addFooter();
    
    // Save the PDF
    const fileName = `Inventory_Value_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    const pdfBlob = doc.output('bloburl');
    window.open(pdfBlob);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating inventory value report:', error);
    return { success: false, error: error.message };
  }
};
