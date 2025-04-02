const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv').config();
const ensureReceiptDirectory = () => {
  const receiptDir = path.join(__dirname, '../receipts');
  if (!fs.existsSync(receiptDir)) {
    fs.mkdirSync(receiptDir, { recursive: true });
  }
  return receiptDir;
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass is set:', !!process.env.EMAIL_PASSWORD);

const generateReceipt = async (payment, receiptPath) => {
  const receiptContent = `
PAYMENT RECEIPT
-------------------
Reference: ${payment.reference}
Amount: ${payment.amount} ${payment.currency}
Status: ${payment.status}
Email: ${payment.userEmail}
Date: ${new Date().toLocaleString()}
-----------------
Thank you for your purchase!
`;

  fs.writeFileSync(receiptPath, receiptContent);
};

const sendReceiptEmail = async (email, reference) => {

  if (!transporter) {
    console.error('Email transporter not configured. Cannot send receipt to:', email);
    return }

const receiptPath = path.join(__dirname, `../receipts/receipt-${reference}.txt`);

  if (!fs.existsSync(receiptPath)) {
    console.error('Receipt file not found: ' + receiptPath);
    return;
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Payment Receipt',
    text: `Dear Customer,\n\nPlease find your payment receipt attached`,
    attachments: [
      {
        filename: 'payment_receipt.txt',
        path: receiptPath,
      },
    ],
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('Payment receipt sent to:', email);
  } catch (error) {
    console.error('Payment receipt email error:', error);
  }
};

const verifyPayment = async (req, res) => {

  const { reference } = req.query;
  
  if (!reference) {
    return res.status(400).json({ error: 'Reference parameter is required' });
  }
  
  console.log(`Verifying payment with reference: ${reference}`);
  
  try {
    // Ensure receipts directory exists
    ensureReceiptDirectory();
    
    // Use the correct Paystack verification endpoint with the reference
    const verifyUrl = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;
    console.log(`Calling Paystack API: ${verifyUrl}`);
    
    const response = await axios.get(verifyUrl, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Paystack response status:', response.status);
    console.log('Paystack response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.status && response.data.data.status === 'success') {
      // Get user email from the authenticated user or the customer data
      const userEmail = req.user?.email || response.data.data.customer.email;
      
      const payment = {
        reference: reference,
        amount: (response.data.data.amount / 100).toFixed(2),
        currency: response.data.data.currency,
        status: response.data.data.status,
        userEmail: userEmail,
      };
      
      const receiptPath = path.join(__dirname, `../receipts/receipt-${payment.reference}.txt`);
      await generateReceipt(payment, receiptPath);
      
      await sendReceiptEmail(payment.userEmail, payment.reference);
      
      return res.json({ 
        message: 'Payment successful, receipt sent to email.', 
        reference: payment.reference 
      });
    } else {
      return res.status(400).json({ 
        error: 'Payment verification failed', 
        details: response.data.message || 'Payment not successful'
      });
    }
  } catch (error) {
    console.error('Verification error:', error.message);
    
    if (error.response) {
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      return res.status(error.response.status || 500).json({ 
        error: 'Payment verification failed', 
        details: error.response.data.message || error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Payment verification failed', 
      details: error.message 
    });
  }
};

module.exports = { verifyPayment };