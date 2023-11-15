// models/formBuilderModel.js
const mongoose = require('mongoose');

const formBuilderSchema = new mongoose.Schema({
  formStructure: [
    {
      name: String,
      type: String, // 'text', 'image', 'document', etc.
    },
  ],
});

const FormBuilder = mongoose.model('FormBuilder', formBuilderSchema);

module.exports = FormBuilder;
