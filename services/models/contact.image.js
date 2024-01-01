const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactImage = new Schema ({
    message: {
        type: String,
        required: true,
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

const ImageContact = mongoose.model('ImageContact', ContactImage);
module.exports = ImageContact;