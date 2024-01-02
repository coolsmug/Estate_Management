const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MissionSchema = new Schema({
    img:{
        url: String,       // Cloudinary URL
        publicId: String,
    },

    heading: {
        type: String,
        required: true,
        trim: true
    },

    mission: {
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

const Mission = mongoose.model("Mission", MissionSchema);
module.exports = Mission;