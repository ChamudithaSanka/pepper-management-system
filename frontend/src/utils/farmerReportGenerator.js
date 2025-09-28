import jsPDF from 'jspdf';

// Company details - same as other reports
const COMPANY_DETAILS = {
  name: 'CeylonPepper',
  address: '255A, Welivita, Malabe',
  phone: '+94 11 234 5678',
  email: 'info@ceylonpepper.com',
  website: 'www.ceylonpepper.com'
};

export const generateFarmerReportPDF = async (farmers, filters = {}) => {
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
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        logoImg.onload = () => {
          doc.addImage(logoImg, 'PNG', 15, 15, 20, 20);
          
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
          doc.text(COMPANY_DETAILS.name, pageWidth - 80, 30);
          resolve();
        };
        
        logoImg.src = '/images/logo1.png';
      });
    } catch (error) {
      doc.setFontSize(20);
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

    doc.text(COMPANY_DETAILS.address, 40, 28);
    doc.text(COMPANY_DETAILS.phone, 40, 34);
  };

  // Helper function to add report header
  const addReportHeader = () => {
    doc.setFontSize(16);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Farmer Management Report', pageWidth - 30, 25, { align: 'right' });
    
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${currentDate}`, pageWidth - 30, 32, { align: 'right' });
  };

  // Helper function to add report summary
  const addReportSummary = () => {
    const startY = 50;
    
    // Calculate summary statistics
    const totalFarmers = farmers.length;
    const activeFarmers = farmers.filter(farmer => farmer.status === 'Active').length;
    const inactiveFarmers = farmers.filter(farmer => farmer.status === 'Inactive').length;
    const totalGreenCapacity = farmers.reduce((sum, farmer) => sum + (farmer.pepper_capacitypermonth?.green || 0), 0);
    const totalBlackCapacity = farmers.reduce((sum, farmer) => sum + (farmer.pepper_capacitypermonth?.black || 0), 0);
    
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Summary', 25, startY + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const summary = [
      { label: 'Total Farmers:', value: totalFarmers },
      { label: 'Active Farmers:', value: activeFarmers },
      { label: 'Inactive Farmers:', value: inactiveFarmers },
      { label: 'Total Green Capacity:', value: `${totalGreenCapacity} kg` },
      { label: 'Total Black Capacity:', value: `${totalBlackCapacity} kg` }
    ];
    
    summary.forEach((item, index) => {
      const y = startY + 15 + (index * 6);
      doc.text(item.label, 25, y);
      doc.setFont('helvetica', 'bold');
      doc.text(item.value.toString(), 25 + 40, y);
      doc.setFont('helvetica', 'normal');
    });
  };

  // Helper function to add filters info
  const addFiltersInfo = () => {
    const startY = 50;
    
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Filters', 115, startY + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const filterInfo = [
      { label: 'Status Filter:', value: filters.status || 'All Status' },
      { label: 'Search Term:', value: filters.search || 'None' },
      { label: 'Location Filter:', value: filters.location || 'All Locations' }
    ];
    
    filterInfo.forEach((item, index) => {
      const y = startY + 15 + (index * 6);
      doc.text(item.label, 115, y);
      doc.setFont('helvetica', 'bold');
      doc.text(item.value.toString(), 115 + 35, y);
      doc.setFont('helvetica', 'normal');
    });
  };

  // Helper function to add farmer details table
  const addFarmerDetailsTable = () => {
    const startY = 100;
    const tableTop = startY + 10;
    
    // Table headers
    const headers = ['Farmer ID', 'Name', 'NIC', 'Phone', 'Status', 'Green Cap', 'Black Cap', 'Location'];
    const colWidths = [20, 25, 20, 20, 15, 15, 15, 30];
    const colPositions = [20, 40, 65, 85, 105, 120, 135, 150];
    
    // Draw table header
    doc.setFillColor(...lightGray);
    doc.rect(15, tableTop, pageWidth - 30, 10, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    
    headers.forEach((header, index) => {
      doc.text(header, colPositions[index], tableTop + 7);
    });
    
    // Draw table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    
    let currentY = tableTop + 10;
    const rowHeight = 8;
    const maxRowsPerPage = 25;
    let rowCount = 0;
    
    farmers.forEach((farmer, index) => {
      // Check if we need a new page
      if (rowCount >= maxRowsPerPage) {
        doc.addPage();
        currentY = 20;
        rowCount = 0;
        
        // Redraw headers on new page
        doc.setFillColor(...lightGray);
        doc.rect(15, currentY, pageWidth - 30, 10, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        headers.forEach((header, index) => {
          doc.text(header, colPositions[index], currentY + 7);
        });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        currentY += 10;
      }
      
      // Farmer data
      const farmerData = [
        farmer.farmerId || 'N/A',
        farmer.name || 'N/A',
        farmer.nic || 'N/A',
        farmer.phone || 'N/A',
        farmer.status || 'N/A',
        `${farmer.pepper_capacitypermonth?.green || 0}kg`,
        `${farmer.pepper_capacitypermonth?.black || 0}kg`,
        farmer.farm_location?.address || 'N/A'
      ];
      
      // Draw row
      farmerData.forEach((data, colIndex) => {
        const text = data.toString();
        const maxWidth = colWidths[colIndex] - 2;
        
        // Truncate text if too long
        const truncatedText = doc.getTextWidth(text) > maxWidth ? 
          text.substring(0, Math.floor(maxWidth / 3)) + '...' : text;
        
        doc.text(truncatedText, colPositions[colIndex], currentY + 5);
      });
      
      currentY += rowHeight;
      rowCount++;
    });
  };

  // Helper function to add footer
  const addFooter = () => {
    const footerY = pageHeight - 20;
    
    doc.setFontSize(8);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated by CeylonPepper Farmer Management System`, 25, footerY);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 30, footerY, { align: 'right' });
  };

  // Generate the PDF
  try {
    await addLogo();
    addCompanyDetails();
    addReportHeader();
    addReportSummary();
    addFiltersInfo();
    addFarmerDetailsTable();
    addFooter();
    
    // Save the PDF
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `Farmer_Report_${currentDate}.pdf`;
    const pdfBlob = doc.output('bloburl');
    window.open(pdfBlob);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};
