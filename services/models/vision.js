const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VisionSchema = ({
    img:{
        data: Buffer,
        contentType: String,
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
    }
})

const Vision = mongoose.model("Vision", VisionSchema);
module.exports = Vision;