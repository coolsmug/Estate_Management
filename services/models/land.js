const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const landSchema = new Schema ({
    land_id : {
        type: String,
        required: true,
         trim: true
    },
    name : {
        type: String,
        required: true,
         trim: true
    },
    location : {
        type: String,
        required: true,
         trim: true
    },
    status : {
        type: String,
        required: true,
         trim: true
    },
    price : {
        type: String,
        required: true,
         trim: true
    },
    period : {
        type: String,
        required: true,
         trim: true
    },

    area : {
        type: String,
        required: true,
         trim: true
    },

    amenities : [
         String
    ],

    description : {
        type: String,
        required: true,
         trim: true
    },

    img: { 
        url: String,       // Cloudinary URL
        publicId: String,
    },

    image: { 
        url: String,       // Cloudinary URL
        publicId: String,
        },
    
},
{ timestamps: true }
);

const Land = mongoose.model("Land", landSchema);

module.exports = Land;