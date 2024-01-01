const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const staffSchema = new Schema ({
    first_name : {
        type: String,
        required: true,
         trim: true
    },
    second_name: {
        type: String,
        required: true,
         trim: true
    },
    position: {
        type: String,
        trim: true
    },
    other_position: {
        type: String,
        trim: true
    },

    propid: [
        String
   ],

    landid: [
        String
   ], 
   
    email: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false,
    },
    managingStatus: {
        type: Boolean,
        default: false,
    },
    performance:{
        type: String,
        required: true,
         trim: true
    },
    phone: {
        type: String,
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
    img:{
        url: String,       // Cloudinary URL
        publicId: String,
    },
},
{ timestamps: true }
);

const Staff = mongoose.model("Staff", staffSchema);

module.exports = Staff;


