const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const careerSchema = new Schema ({

    jobName : {
        type: String,
        required: true,
        trim: true
    },
   
    jobDescription: [
         String
    ],
    status: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now // Set default value to the current date and time when the document is created
    },

},
{ timestamps: true }
);

const Career = mongoose.model("Career", careerSchema);

module.exports = Career;