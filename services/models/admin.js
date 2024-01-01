const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema ({
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
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: Boolean,
        default: false,

    },
    email:{
        type: String,
        required: true,
    },
    img:{
        url: String,       // Cloudinary URL
        publicId: String,
    },
},
{ timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;


