const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testimonySchema = new Schema ({
    full_name : {
        type: String,
        required: true,
        trim: true
    },
    testimony: {
        type: String,
        required: true,
        trim: true
    },
    img:{
        url: String,       // Cloudinary URL
        publicId: String,
    },
    createdAt: {
        type: Date,
        default: Date.now // Set default value to the current date and time when the document is created
    },
},
{ timestamps: true }
);

const Testimony = mongoose.model("Testimony", testimonySchema);

module.exports = Testimony;
