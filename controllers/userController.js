const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.registerUser = async (req, res) => {
  try {
    console.log('📥 Received subscription request:', req.body);
    
    const requiredFields = ['name', 'email', 'whatsapp', 'subscriptionPlan', 'paymentMethod', 'paymentMade'];
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
      paymentMade: req.body.paymentMade.trim()
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

        await transporter.sendMail({
          from: process.env.ADMIN_EMAIL,
          to: process.env.ADMIN_EMAIL,
          subject: 'Success Premium Subscription',
          html: `<h2>New Subscription Details</h2>
                 <pre>${JSON.stringify(req.body, null, 2)}</pre>`
        });
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