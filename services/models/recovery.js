const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recoverySchema = new Schema ({
    recovery: {
        type: String,
        required: true,
        trim: true
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
},
{ timestamps: true }
);

const Recovery = mongoose.model("Recovery", recoverySchema);

module.exports = Recovery;


