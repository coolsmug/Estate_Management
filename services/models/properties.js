const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const propertySchema = new Schema ({
    property_id : {
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
    price : {
      type: String,
      required: true,
       trim: true
  },
    status : {
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
    bed : {
        type: String,
        required: true,
         trim: true
    },
    baths : {
        type: String,
        required: true,
         trim: true
    },
    garage : {
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
  img2: { 
    url: String,       // Cloudinary URL
    publicId: String,
  },
  floor_plan: { 
    url: String,       // Cloudinary URL
    publicId: String,
  },
  video: { 
    cloudinaryId: String,
    videoUrl: String,
  },
    
},
{ timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;