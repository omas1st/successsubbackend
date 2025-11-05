const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  email:            { type: String, required: true },
  whatsapp:         { type: String, required: true },
  subscriptionPlan: { type: String, required: true },
  paymentMethod:    { type: String, required: true },
  paymentMade:      { type: String, required: true },
  receiptUrl:       { type: String, required: true }, // New required field
  subscribedAt:     { type: Date,   default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
