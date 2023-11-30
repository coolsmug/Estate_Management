const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MissionSchema = ({
    img:{
        data: Buffer,
        contentType: String,
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
    }
})

const Mission = mongoose.model("Mission", MissionSchema);
module.exports = Mission;