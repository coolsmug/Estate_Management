// models/formSubmissionModel.js
const mongoose = require('mongoose');

const formSubmissionSchema = new mongoose.Schema({
  // Dynamically add fields based on the form structure
});

const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);

module.exports = FormSubmission;
