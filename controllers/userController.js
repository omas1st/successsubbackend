const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.registerUser = async (req, res) => {
  try {
    console.log('📥 Received subscription request:', req.body);
    
    const requiredFields = ['name', 'email', 'whatsapp', 'subscriptionPlan', 'paymentMethod', 'paymentMade', 'receiptUrl'];
    for (const field of requiredFields) {
      if (!req.body[field]?.trim()) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }

    const user = new User({
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      whatsapp: req.body.whatsapp.trim(),
      subscriptionPlan: req.body.subscriptionPlan.trim(),
      paymentMethod: req.body.paymentMethod.trim(),
      paymentMade: req.body.paymentMade.trim(),
      receiptUrl: req.body.receiptUrl.trim() // Store Cloudinary URL
    });

    const savedUser = await user.save();
    console.log('📝 Saved user:', savedUser);

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.ADMIN_EMAIL,
            pass: process.env.ADMIN_EMAIL_PASSWORD
          }
        });

        const emailHtml = `
          <h2>New Subscription Details</h2>
          <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
            <tr>
              <th style="background-color: #f2f2f2; padding: 8px;">Field</th>
              <th style="background-color: #f2f2f2; padding: 8px;">Value</th>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Name</strong></td>
              <td style="padding: 8px;">${req.body.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Email</strong></td>
              <td style="padding: 8px;">${req.body.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>WhatsApp</strong></td>
              <td style="padding: 8px;">${req.body.whatsapp}</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Subscription Plan</strong></td>
              <td style="padding: 8px;">${req.body.subscriptionPlan}</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Payment Method</strong></td>
              <td style="padding: 8px;">${req.body.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Payment Made</strong></td>
              <td style="padding: 8px;">${req.body.paymentMade}</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Payment Receipt</strong></td>
              <td style="padding: 8px;">
                <a href="${req.body.receiptUrl}" target="_blank" style="color: #007bff; text-decoration: none;">
                  View Payment Receipt
                </a>
              </td>
            </tr>
          </table>
          <br>
          <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
        `;

        await transporter.sendMail({
          from: process.env.ADMIN_EMAIL,
          to: process.env.ADMIN_EMAIL,
          subject: 'Success Premium Subscription - New Payment Receipt Uploaded',
          html: emailHtml
        });
        
        console.log('📧 Notification email sent with receipt link');
      } catch (mailErr) {
        console.error('📧 Email error:', mailErr);
      }
    }

    return res.status(201).json({ message: 'Subscription successful' });
  } catch (err) {
    console.error('💥 Registration Error:', err);
    return res.status(500).json({ 
      message: 'Server error',
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ subscribedAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('📂 Fetch Users Error:', err);
    res.status(500).json({ message: 'Failed to fetch subscriptions' });
  }
};
