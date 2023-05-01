const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AboutSchema = new Schema ({
    company_name: {
        type: String,
        required: true,
        trim: true
    },
    
    address: {
        type: String,
        required: true,
        trim: true
    },
    
    state: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true
    },
        
    mobile2: {
        type: String,
        trim: true
    },
    mobile3: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
     email: {
        type: String,
        required: true,
        trim: true
    },
    
    img:{
        data: Buffer,
        contentType: String,
    },
    
    heading: {
        type: String,
        required: true,
        trim: true
    },
    
    about: {
        type: String,
        required: true,
        trim: true
    },
    linkedin: {
        type: String,
        trim: true
    },
    facebook: {
        type: String,
        trim: true
    },

    instagram: {
        type: String,
        trim: true
    },
    twitter: {
        type: String,
        trim: true
    },
    whatsapp: {
        type: String,
        trim: true
    },

  },
  { timestamps: true }
  );

const About = mongoose.model("About", AboutSchema);
module.exports = About;

