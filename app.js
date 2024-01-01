if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require("express");
const path = require('path');
const morgan = require("morgan");
const ejs = require("ejs");
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcrypt');
const methodOverride = require("method-override");
const multer = require("multer");
const {GridFsStorage} = require('multer-gridfs-storage');
require('./services/config/passport')(passport);
const Property = require("./services/models/properties");
const Land = require("./services/models/land");
const Blog = require("./services/models/blog");
const Admin = require("./services/models/admin");
const Staff = require('./services/models/staff');
const About = require('./services/models/about');
const Service = require('./services/models/services');
const Subscriber = require('./services/models/subscriber');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const sessionSecret = crypto.randomBytes(20).toString('hex');
const MongoDBStore = require('connect-mongodb-session')(session);
const PORT = process.env.PORT || 5000;
const connectDB = require('./services/database/connection');
const PASSWORD_EMAIL = process.env.PASSWORD_EMAIL;
const URI = process.env.MONGODB_URI ;
connectDB();



const store = new MongoDBStore({
  uri: URI,
  collection: 'mySessions'
});

store.on('error', (error) => {
  console.error('MongoDB session store error:', error);
});

const app = express();
app.use(morgan('tiny'));
app.use(cors());

//body parser
app.set("view engine", "ejs");
app.use(express.urlencoded( { extended : true } ));
app.use(express.json());
app.use(flash());

app.use(
    session( {
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        store: store,
        cookies: { 
          secure: true, // Set to true if using HTTPS
          httpOnly: true,
          maxAge: 60 * 60 * 1000 
        } // 1 hour
    } )
);


app.use((req, res, next) => {
  if (!req.session.visitorCount) {
    req.session.visitorCount = 1;
  } else {
    req.session.visitorCount += 1;
  }
  
  if (!req.session.likedBlogPosts) {
    req.session.likedBlogPosts = [];
  }

  next();
});

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
  });

  app.use('/animated.css/animate.min.css', (req, res, next) => {
    res.setHeader('Content-Type', 'text/css');
    next();
  });

  app.use('/bootstrap/css/', (req, res, next) => {
    res.setHeader('Content-Type', 'text/css');
    next();
  });

app.use('/css', express.static(path.resolve(__dirname, "assets/css")));
app.use('/img', express.static(path.resolve(__dirname, "assets/img")));
app.use('/js', express.static(path.resolve(__dirname, "assets/js")));
app.use('/animate.css/animate.min.css', express.static(path.resolve(__dirname, "assets/vendor/animate.css/animate.min.css")));
app.use('/bootstrap/css', express.static(path.resolve(__dirname, "assets/vendor/bootstrap/css")));
app.use('/bootstrap/js/', express.static(path.resolve(__dirname, "assets/vendor/bootstrap/js")));
app.use('/bootstrap-icons', express.static(path.resolve(__dirname, "assets/vendor/bootstrap-icons")));
app.use('/fonts', express.static(path.resolve(__dirname, "assets/vendor/bootstrap-icons/fonts")));
app.use('/php-email-form', express.static(path.resolve(__dirname, "assets/vendor/php-email-form")));
app.use('/swiper', express.static(path.resolve(__dirname, "assets/vendor/swiper")));


// app.use(express.static("."));

  
  app.use( (req, res, next) =>{
  
  res.header("Access-Control-Allow-origin", "*" , "fonts.googleapis.com", "fonts.gstatic.com")
  
  res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE")
  
  res.header("Access-Control-Allow-Headers", "Origin",
  
  "X-Requested-With", "Content-Type", "Accept")
  
  next()
  });

  app.use('/admin', require('./services/routes/admin'));
  app.use('/', require('./services/routes/index'));




//   //updating Images
//   const uploadMultipleImages = upload.fields([
//     { name: 'img', maxCount: 1 },
//     { name: 'img2', maxCount: 1 },
//     { name: 'floor_plan', maxCount: 1 },
//     { name: 'video', maxCount: 1 }
//   ], function (err) {
//     if (err) {
//       console.log(err);
//       // Handle the error here
//     }
//   });



// //creating staff
// const uploadSingleStaffImage = upload.single("img");











//subscriber
// Create a new instance of GridFsStorage
// const storages = new GridFsStorage({
//   url: URI,
//   file: (req, file) => {
//     return new Promise((resolve, reject) => {
//       crypto.randomBytes(16, (err, buf) => {
//         if (err) {
//           return reject(err);
//         }
//         const filename = buf.toString('hex') + path.extname(file.originalname);
//         const fileInfo = {
//           filename: filename,
//           bucketName: 'uploads'
//         };
//         resolve(fileInfo);
//       });
//     });
//   }
// });

// Create a middleware to handle file uploads using multer and the storage defined above
// const uploaded = multer({ storages });

// Handle the post request to upload a file and send an email



//Email Single reply












//------------------------------End ----------------------------//



//-----------------------career------------------------------------//

// app.post('/create-form', async (req, res) => {
//   try {
//     const formStructure = req.body.formStructure;
//     const formSchema = new mongoose.Schema({});
//     formStructure.forEach((field) => {
//       formSchema.add({ [field.name]: { type: field.type, default: null } });
//     });
//     const FormBuilder = mongoose.model('FormBuilder', formSchema);
//     res.status(201).json({ success: true });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// });

// // Get the form structure for users
// app.get('/get-form-structure', async (req, res) => {
//   try {
//     const form = await FormBuilder.findOne(); // You may need to adjust this query based on your schema
//     if (form) {
//       const formStructure = form.schema.obj;
//       res.json({ success: true, formStructure });
//     } else {
//       res.status(404).json({ success: false, error: 'Form not found' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// });

// // Handle user form submissions
// app.post('/submit-form', async (req, res) => {
//   try {
//     const formData = req.body;
//     const newFormEntry = new FormSubmission(formData);
//     await newFormEntry.save();
//     res.status(201).json({ success: true });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// });

const server = app.listen(PORT, () => {
    let host = server.address().address;
    let port = server.address().port;
    console.log(`server running and listening at http:/%s, %%s, ${host}, ${port}`);
})
  

