const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.registerUser = async (req, res) => {
  try {
    console.log('📥 Received subscription request:', req.body);
    
    const requiredFields = ['name', 'email', 'whatsapp', 'subscriptionPlan', 'paymentMethod', 'paymentMade', 'receiptUrl'];
    for (const field of requiredFields) {
      if (!req.body[field]?.trim()) {
        return res.status(400).json({ 
          message: `Missing required field: ${field}`,
          receivedFields: Object.keys(req.body)
        });
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
          <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px; font-family: Arial, sans-serif;">
            <tr>
              <th style="background-color: #f2f2f2; padding: 8px; text-align: left;">Field</th>
              <th style="background-color: #f2f2f2; padding: 8px; text-align: left;">Value</th>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${req.body.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${req.body.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>WhatsApp</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${req.body.whatsapp}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Subscription Plan</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${req.body.subscriptionPlan}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Method</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${req.body.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Made</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${req.body.paymentMade}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Receipt</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">
                <a href="${req.body.receiptUrl}" target="_blank" style="color: #007bff; text-decoration: none; font-weight: bold;">
                  🔗 View Payment Receipt
                </a>
                <br><br>
                <small>If the link doesn't work, copy and paste this URL in your browser:</small><br>
                <code style="background: #f4f4f4; padding: 5px; border-radius: 3px; word-break: break-all;">${req.body.receiptUrl}</code>
              </td>
            </tr>
          </table>
          <br>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0;"><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
            <p style="margin: 5px 0 0 0;"><strong>User ID:</strong> ${savedUser._id}</p>
          </div>
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
        // Don't fail the request if email fails, just log it
      }
    }

    return res.status(201).json({ 
      message: 'Subscription successful',
      userId: savedUser._id 
    });
  } catch (err) {
    console.error('💥 Registration Error:', err);
    
    // More specific error messages for common issues
    let errorMessage = 'Server error';
    if (err.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(err.errors).map(e => e.message).join(', ');
    } else if (err.code === 11000) {
      errorMessage = 'Duplicate entry: This email is already subscribed';
    }
    
    return res.status(500).json({ 
      message: errorMessage,
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
