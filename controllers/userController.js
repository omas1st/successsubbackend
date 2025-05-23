const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.registerUser = async (req, res) => {
  try {
    const { name, email, whatsapp, subscriptionPlan, paymentMethod, paymentMade } = req.body;

    // Validate required fields
    for (const field of ['name','email','whatsapp','subscriptionPlan','paymentMethod','paymentMade']) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `Missing field: ${field}` });
      }
    }

    // Save subscription
    const user = new User({ name, email, whatsapp, subscriptionPlan, paymentMethod, paymentMade });
    await user.save();

    // Send notification email to admin if creds exist
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
          text: `New subscription details:\n${JSON.stringify(req.body, null, 2)}`
        });
      } catch (mailErr) {
        console.error('⚠️  Email send failed:', mailErr);
        // NOTE: we do NOT return a 500 here
      }
    } else {
      console.warn('⚠️  Skipping email: ADMIN_EMAIL or ADMIN_EMAIL_PASSWORD not set');
    }

    // Always return success
    return res.status(201).json({ message: 'Subscription successful' });
  } catch (err) {
    console.error('💥 registerUser error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllUsers = async (_req, res) => {
  try {
    const all = await User.find().sort({ subscribedAt: -1 });
    return res.json(all);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch subscriptions', error: err.message });
  }
};
