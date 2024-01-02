const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VisionSchema = new Schema({
    img:{
        url: String,       // Cloudinary URL
        publicId: String,
    },

    heading: {
        type: String,
        required: true,
        trim: true
    },

    vision: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now // Set default value to the current date and time when the document is created
    },
},
{ timestamps: true }
);

const Vision = mongoose.model("Vision", VisionSchema);
module.exports = Vision;