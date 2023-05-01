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
  date: {
      type: Date,
      default: Date.now,
  },
  img:{
      data: Buffer,
      contentType: String,
  },
  img2:{
    data: Buffer,
    contentType: String,
},
},
{ timestamps: true }
);

const Blog = mongoose.model('Blog', BlogSchema);
module.exports = Blog;