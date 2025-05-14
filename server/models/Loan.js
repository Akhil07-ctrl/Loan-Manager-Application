const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fullName: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 1000,
    max: 50000
  },
  tenure: { 
    type: Number, 
    required: true,
    min: 6,
    max: 60
  },
  reason: { 
    type: String, 
    required: true 
  },
  employmentAddress: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'], 
    default: 'Pending' 
  },
  dateApplied: { 
    type: Date, 
    default: Date.now 
  },
  dateProcessed: { 
    type: Date 
  },
  processedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  notes: { 
    type: String 
  },
  remainingAmount: {
    type: Number,
    min: 0
  },
  repayments: [{
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    date: {
      type: Date,
      default: Date.now
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  lastPaymentDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);