const mongoose = require('mongoose');

// Base feedback schema with common fields
const baseFeedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  uhid: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  overallExperience: {
    type: String,
    required: true,
    enum: ['Excellent', 'Good', 'Fair', 'Poor']
  },
  nominateEmployee: {
    type: String,
    default: ''
  },
  comments: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// OPD Feedback Schema
const opdFeedbackSchema = new mongoose.Schema({
  ...baseFeedbackSchema.obj,
  // OPD specific fields
  appointmentBooking: String,
  receptionStaff: String,
  billingProcess: String,
  nursingCare: String,
  labStaffSkilled: String,
  labWaitingTime: String,
  radiologyStaffSkilled: String,
  radiologyWaitingTime: String,
  pharmacyWaitingTime: String,
  medicationDispensed: String,
  drugExplanation: String,
  counsellingSession: String,
  audiologyStaffSkilled: String,
  hospitalCleanliness: String,
  type: {
    type: String,
    default: 'OPD'
  }
});

// IPD Feedback Schema
const ipdFeedbackSchema = new mongoose.Schema({
  ...baseFeedbackSchema.obj,
  // IPD specific fields
  registrationProcess: String,
  roomReadiness: String,
  roomCleanliness: String,
  doctorExplanation: String,
  nurseCommunication: String,
  planExplanation: String,
  promptnessAttending: String,
  pharmacyTimeliness: String,
  billingCourtesy: String,
  operationsHospitality: String,
  dischargeProcess: String,
  type: {
    type: String,
    default: 'IPD'
  }
});

// Create models
const OPDFeedback = mongoose.model('OPDFeedback', opdFeedbackSchema);
const IPDFeedback = mongoose.model('IPDFeedback', ipdFeedbackSchema);

module.exports = {
  OPDFeedback,
  IPDFeedback
};
