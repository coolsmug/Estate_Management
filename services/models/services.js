const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServiceSchema = ({
    img:{
        data: Buffer,
        contentType: String,
    },
    img2:{
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
    }
})

const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;