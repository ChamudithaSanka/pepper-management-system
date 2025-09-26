import jsPDF from 'jspdf';

// Company details - you can modify these as needed
const COMPANY_DETAILS = {
  name: 'CeylonPepper',
  address: '255A, Welivita, Malabe',
  phone: '+94 11 234 5678',
  email: 'info@ceylonpepper.com',
  website: 'www.ceylonpepper.com'
};

export const generateOrderConfirmationPDF = async (orderData) => {
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
          // Add logo image (20x20 pixels) in top left
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
          doc.text(COMPANY_DETAILS.name, pageWidth - 80, 24);
          
          resolve();
        };
        
        logoImg.src = '/images/logo1.png';
      });
    } catch (error) {
      // Fallback to text logo
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

    // Add company address and phone number
    doc.text(COMPANY_DETAILS.address, 40, 28);
    doc.text(COMPANY_DETAILS.phone, 40, 34);
  };

  // Helper function to add order header
  const addOrderHeader = () => {
    // Add order ID and status
    doc.setFontSize(16);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`Order #${orderData.orderId}`, 20, 50);
    
    // Add status badge
    const statusColor = orderData.orderStatus === 'Confirmed' ? [255, 193, 7] : 
                       orderData.orderStatus === 'Delivered' ? [34, 197, 94] : 
                       orderData.orderStatus === 'Cancelled' ? [239, 68, 68] : [59, 130, 246];
    
    doc.setFillColor(...statusColor);
    doc.roundedRect(80, 45, 25, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(orderData.orderStatus, 85, 51);
    
    // Add total amount and date on the right
    doc.setTextColor(...darkColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`LKR ${orderData.totalAmount.toFixed(2)}`, pageWidth - 30, 50, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(orderData.createdAt).toLocaleDateString(), pageWidth - 30, 58, { align: 'right' });
  };

  // Helper function to add items section
  const addItemsSection = () => {
    const startY = 70;
    
    // Add section title
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Items:', 20, startY);
    
    // Add items box
    const boxY = startY + 5;
    const boxHeight = 25;
    
    // Draw light gray background
    doc.setFillColor(...lightGray);
    doc.rect(20, boxY, pageWidth - 40, boxHeight, 'F');
    
    // Add item details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(orderData.items[0]?.productName || 'Product', 25, boxY + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Quantity: ${orderData.items[0]?.quantity || 1} × LKR ${orderData.items[0]?.unitPrice?.toFixed(2) || orderData.totalAmount.toFixed(2)}`, 25, boxY + 15);
    
    // Add item total on the right
    doc.setFont('helvetica', 'bold');
    doc.text(`LKR ${orderData.totalAmount.toFixed(2)}`, pageWidth - 30, boxY + 8, { align: 'right' });
  };

  // Helper function to add delivery address
  const addDeliveryAddress = () => {
    const startY = 110;
    
    // Add section title
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Address:', 20, startY);
    
    // Add address
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let address = 'No address provided';
    
    if (orderData.deliveryAddress) {
      if (orderData.deliveryAddress.fullAddress) {
        address = orderData.deliveryAddress.fullAddress;
      } else if (orderData.deliveryAddress.street || orderData.deliveryAddress.city) {
        // Construct address from individual fields
        const parts = [];
        if (orderData.deliveryAddress.street) parts.push(orderData.deliveryAddress.street);
        if (orderData.deliveryAddress.city) parts.push(orderData.deliveryAddress.city);
        if (orderData.deliveryAddress.zipCode) parts.push(orderData.deliveryAddress.zipCode);
        address = parts.join(', ');
      }
    }
    
    doc.text(address, 20, startY + 8);
  };

  // Helper function to add estimated delivery
  const addEstimatedDelivery = () => {
    const startY = 110;
    
    // Add section title
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Estimated Delivery:', pageWidth - 80, startY);
    
    // Add delivery date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const deliveryDate = orderData.estimatedDeliveryDate ? 
      new Date(orderData.estimatedDeliveryDate).toLocaleDateString() : 'N/A';
    doc.text(deliveryDate, pageWidth - 80, startY + 8);
  };

  // Helper function to add footer
  const addFooter = () => {
    const footerY = pageHeight - 30;
    
    // Add payment status
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Status:', 20, footerY);
    
    // Add payment status badge
    const paymentColor = orderData.paymentStatus === 'Completed' ? [34, 197, 94] : 
                        orderData.paymentStatus === 'Failed' ? [239, 68, 68] : [255, 193, 7];
    
    doc.setFillColor(...paymentColor);
    doc.roundedRect(50, footerY - 6, 25, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(orderData.paymentStatus, 55, footerY);
    
    // Add notes
    doc.setTextColor(...darkColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', pageWidth - 60, footerY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Order placed through website', pageWidth - 60, footerY + 8);
  };

  // Generate the PDF
  try {
    await addLogo();
    addCompanyDetails();
    addOrderHeader();
    addItemsSection();
    addDeliveryAddress();
    addEstimatedDelivery();
    addFooter();
    
    // Save the PDF
    const fileName = `Order_Confirmation_${orderData.orderId}.pdf`;
    const pdfBlob = doc.output('bloburl');
    window.open(pdfBlob);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};
