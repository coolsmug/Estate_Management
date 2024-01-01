const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = new Schema ({
  fullname : {
      type: String,
      required: true,
      trim: true
  },
  category: {
      type: String,
      required: true,
      trim: true
  },
  article: {
      type: String,
      required: true,
      trim: true
  },
  topic: {
      type: String,
      required: true,
      trim: true
  },
  likes: {
    type: Number,
    default: 0,
},
views: {
    type: Number,
    default: 0,
},
  
  date: {
      type: Date,
      default: Date.now,
  },
  img: { 
    url: String,       // Cloudinary URL
    publicId: String,
},
img2: { 
  url: String,       // Cloudinary URL
  publicId: String,
},
},
{ timestamps: true }
);

const Blog = mongoose.model('Blog', BlogSchema);
module.exports = Blog;