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
        data: Buffer,
        contentType: String,
    },
},
{ timestamps: true }
);

const Testimony = mongoose.model("Testimony", testimonySchema);

module.exports = Testimony;
