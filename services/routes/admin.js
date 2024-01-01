if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const router = express.Router();
const Property = require("../models/properties");
const Land = require("../models/land");
const Blog = require("../models/blog");
const Admin = require("../models/admin.js");
const Staff = require('../models/staff');
const Contact = require('../models/contact');
const About = require('../models/about');
const Service = require('../models/services');
const Subscriber = require('../models/subscriber');
const { session } = require("passport");
const passport = require('passport');
var ensureLoggedIn  = require('connect-ensure-login').ensureLoggedIn;
const bcrypt = require('bcrypt');
const Recovery = require('../models/recovery.js');
const nodemailer = require('nodemailer');
const smtpPool = require('nodemailer-smtp-pool');
const CareerCreation = require('../models/newJob');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ImageContact = require('../models/contact.image');
const Vision = require('../models/vision');
const Mission = require('../models/mission.js');
const crypto = require('crypto');
const sessionSecret = crypto.randomBytes(20).toString('hex');



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});



const PASSWORD_EMAIL = process.env.PASSWORD_EMAIL;

const ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash('error_msg', 'Please log in to view that resource');
  res.redirect('/admin/login');

}

const forwardAuthenticated = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/admin/dashboard');     
}


// Login
router.post("/login", forwardAuthenticated, (req, res, next) => {
  passport.authenticate("admin_login", (err, user, info)=> {
    if (err) {
     return next(err) 
    } 
      if(user) {
        req.logIn(user, function(err) {
          if (err) {
            return next(err);
          }
          res.redirect("/admin/dashboard");
          req.flash('success_msg', `You are welcome ${req.user.first_name}`);
          
          
        })
       
      }
      else {
        req.logOut(function (err) {
          if (err) {
              return next(err);
          }
          req.flash('error_msg', 'Login details not correct');
          res.redirect('/admin/login')
          
      })
      }
   
  
  })(req, res, next);
});

//logout
router.post('/logout',  ensureAuthenticated, (req, res, next) => {
  req.logOut(function (err) {
      if (err) {
          return next(err);
      }
      req.flash('error_msg', 'Session Terminated');
      res.redirect('/admin/login')
  })
   

})

router.get('/login', async (req, res) => {
  await res.render('login');
});

router.get('/create-contact-image',  ensureAuthenticated,  async(req, res) => {
  try {
    await res.render('create_contact_image', {
      user: req.user,
    })
  } catch (error) {
    console.log(error)
  }
})

router.get("/dashboard", ensureAuthenticated,  async(req, res) => {
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');
   try {
    const land = await Land.countDocuments({ status: {$in : ["Sale", "Rent"]}}).exec();
    const house = await Property.countDocuments({ status: {$in : ["Sale", "Rent"]}}).exec();
    const staff = await Staff.countDocuments({status : true}).exec();
    const contact = await Contact.countDocuments().exec();
    const lands = await Land.countDocuments({ status: "Sold"}).exec();
    const houses = await Property.countDocuments({ status: "Sold"}).exec();
    const about = await About.find().select("_id company_name name address state mobile mobile2 mobile3 whatsapp email").sort({ createdAt: -1 }).limit(1).exec();
    const service = await Service.find().select("message heading").sort({createdAt : -1}).limit(3)
    const subscriber = await Subscriber.find().select("email").exec();

  await res.render("dashboard", {
      user: req.user,land,house,staff,contact,houses,lands,about: about[0],service, subscriber,
    })
   } catch (error) {
    console.log(error)
    res.json("error:" + error)
   }
});

router.get("/create-housing", ensureAuthenticated, async(req, res) => {
    await res.render("create_housing", {
      user: req.user,
    })
});

router.get("/create-land",ensureAuthenticated, async(req, res) => {
    await res.render("create_land" , {
      user: req.user,
    })
});

router.get("/create-blog", ensureAuthenticated, async(req, res) => {
    await res.render("create_blog" , {
      user: req.user,
    })
});

router.get("/create-admin", ensureAuthenticated, async(req, res) => {
    await res.render("create_admin", {
      user: req.user,
    })
});

router.get("/create-staff", ensureAuthenticated, async(req, res) => {
    await res.render("create_staff" , {
      user: req.user,
    })
});



//create HOUSE  property
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];

    // console.log('File Details:', file);
    // console.log('MIME Type:', file.mimetype);

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }

    cb(null, true);
  }
});

const uploadMultiple = async (req, res, next) => {
  try {
    
    const imgResult = await cloudinary.uploader.upload(req.files['img'][0].path);
    const img2Result = await cloudinary.uploader.upload(req.files['img2'][0].path);
    const floorPlanResult = await cloudinary.uploader.upload(req.files['floor_plan'][0].path);
    console.log('Cloudinary Upload Response:', imgResult);
    req.uploadResults = {
      imgResult,
      img2Result,
      floorPlanResult,
    };
    next();
 
  
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file to Cloudinary.');
  }
};

router.post("/create-property", ensureAuthenticated, upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img2', maxCount: 1 },
  { name: 'floor_plan', maxCount: 1 },

]), uploadMultiple, async (req, res) => {
  try {
    console.log(req.files);

    const {
      imgResult,
      img2Result,
      floorPlanResult,
      // videoResult,
    } = req.uploadResults;

    const {
      property_id, name, location, status, area, bed, baths, garage, amenities, description, period, price
    } = req.body;

     //generate property code
     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
     let voucherCode = '';
     for (let i = 0; i < 4; i++) {
       voucherCode += characters.charAt(Math.floor(Math.random() * characters.length));
     }
     const codes = voucherCode;
 
     const errors = [];
 
     if (!name ||!location ||!status ||!area ||!bed ||!baths ||!garage ||!amenities ||!description ||!period ||!price
     ) {
       errors.push({ msg: "Please fill in all fields." });
     }
     if (errors.length > 0) {
       res.render('create_housing', {
         errors: errors,name: name,user: req.user,location: location,status: status,area: area,bed: bed,baths: baths,
         garage: garage,amenities: amenities,description: description,period: period,price: price,user: req.user,
       });
     } else {

    // Check if property with the given property_id already exists
    const existingProperty = await Property.findOne({ property_id });
    if (existingProperty) {
      errors.push({ msg: 'Oops! ID found with an existing Property. Try Again' });
      res.render('create_housing', {
        errors,name,user: req.user,location,status,area,bed,baths,garage,amenities,description,period,price,
      });
    } else {
      // Create a new property object
      const property = {
        property_id: codes ,
        name : name,
        location : location,
        status : status,
        area : area,
        bed : bed,
        baths : baths,
        garage : garage,
        amenities: amenities.split('  ').map(amenity => amenity.trim()),
        description : description,
        period : period,
        price : price,
        img: {
          url: imgResult.secure_url,
          publicId: imgResult.public_id,
        },
        img2: {
          url: img2Result.secure_url,
          publicId: img2Result.public_id,
        },
        floor_plan: {
          url: floorPlanResult.secure_url,
          publicId: floorPlanResult.public_id,
        },
     
      };

      // Save the property to MongoDB
      await Property.create(property);
      
      req.flash("success_msg", "Data Registered!");
      res.redirect('/admin/create-housing');
    }}
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error.');
  }
});

router.post("/edit-property-image/:id",  upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img2', maxCount: 1 },
  { name: 'floor_plan', maxCount: 1 },
 
]), uploadMultiple, async (req, res) => {
  try {
    const propertyId = req.params.id;

    if (!propertyId) {
      throw new TypeError("Invalid property ID");
    }

    const property = {};

    const {
      imgResult,
      img2Result,
      floorPlanResult,
    } = req.uploadResults;

    if (req.files['img']) {
      property.img = {
        url: imgResult.secure_url,
        publicId: imgResult.public_id,
      }
      }
      if (req.files['img2']) {
        property.img2 = {
          url: imgResult.secure_url,
          publicId: imgResult.public_id,
        }
      }
      if (req.files['floor_plan']) {
        property.floor_plan = {
          url: imgResult.secure_url,
          publicId: imgResult.public_id,
        }
      }
    const filter = { _id: propertyId };
    const update = { $set: property };
    const options = { returnOriginal: false };

    const result = await Property.findOneAndUpdate(filter, update, options);

    if (!result) {
      return res.status(404).json({ error: "Property not found" });
    }
    req.flash("success_msg", "Images Uploaded");
    return res.redirect('/admin/edit-property?id=' + propertyId);
  } catch (error) {
    if (error.name === "CastError" || error.name === "TypeError") {
      return res.status(400).json({ error: error.message });
    }
    console.log(error);
    return res.status(500).send();
  }
});

const storages = multer.memoryStorage();
const { Readable } = require('stream');
const uploadVideo = multer({ storage: storages });
router.post('/upload/:id', uploadVideo.single('video'), async (req, res) => {
  try {
    // Check if a file was provided
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // Convert Buffer to Readable Stream
    const bufferStream = Readable.from(req.file.buffer);

    const id = req.params.id;

    // Use cloudinary.v2.uploader.upload_stream
    const uploaderStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'videos',
      },
      (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: 'Cloudinary upload failed' });
        }

        // Update the property with the Cloudinary result
        Property.findById(id)
          .then((prop) => {
            prop.video = {
              cloudinaryId: result.public_id,
              videoUrl: result.secure_url,
            };
            return prop.save();
          })
          .then(() => {
            req.flash('success_msg', 'Video Uploaded');
            return res.redirect(`/admin/edit-property?id=${id}`);
          })
          .catch((err) => {
            console.error(err);
            res.json(err);
            return res.status(500).json({ error: 'Database update failed' });
          });
      }
    );

    // Pipe the buffer stream to the Cloudinary uploader stream
    bufferStream.pipe(uploaderStream);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


 


//done with HOUSE properties


//Creating property LAND ............................

const uploadMultipleLandImage = async (req, res, next) => {
  try {
    const imgResult = await cloudinary.uploader.upload(req.files['img'][0].path);
    const img2Result = await cloudinary.uploader.upload(req.files['image'][0].path);
  
    console.log('Cloudinary Upload Response:', imgResult);
    req.uploadResults = {
      imgResult,
      img2Result,
    };
    next();
 
  
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file to Cloudinary.');
  }
};

router.post("/create-land",ensureAuthenticated, upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'image', maxCount: 1 },
 
]), uploadMultipleLandImage, async (req, res) => {
  try {

    const {
      imgResult,
      img2Result,
     
    } = req.uploadResults;

    const {land_id, name, location, status, area, amenities, description, period, price,
    } = req.body;

    //generate property code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let voucherCode = '';
    for (let i = 0; i < 4; i++) {
      voucherCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const codes = voucherCode;

    const errors = [];

    if (!name ||!location ||!status ||!area ||!amenities ||!description ||!period ||!price
    ) {
      errors.push({ msg: "Please fill in all fields." });
    }
    if (errors.length > 0) {
      res.render('create_land', {
        errors: errors,name: name,location: location,status: status,area: area, amenities: amenities,
        description: description, period: period,price: price, user: req.user,
 
      });
    } else {
      const existingLand = await Land.findOne({ land_id });
      if (existingLand) {
        errors.push({ msg: 'Oops! ID found with an existing Land Property. Try Again' });
        res.render('create_land', {
          errors: errors,name: name,location: location,status: status,area: area, amenities: amenities,
          description: description, period: period,price: price, user: req.user,
   
        });
      }else 

       {
                  const lands ={
                      land_id: voucherCode,
                      name: name,
                      location: location,
                      status: status,
                      area: area,
                      amenities: amenities.split('  ').map(armenity => armenity.trim()),
                      description: description,
                      price: price,
                      period: period,
                        img: {},
                        image: {},
                    };
            
                    if (req.files['img']) {
                        lands.img = {
                          url: imgResult.secure_url,
                          publicId: imgResult.public_id,
                        };
                      }
                      if (req.files['image']) {
                        lands.image = {
                          url: imgResult.secure_url,
                          publicId: imgResult.public_id,
                        };
                      }
                     
            
                    Land.create(lands)
                                    .then((data) => {
                                        req.flash("success_msg", "Data Registered !");
                                        res.redirect('/admin/create-land');
                                    }).catch((err) => {
                                        console.log(err)
                                    })
                      
              }
         
      
    }
  } catch (error) {
    console.log(error);
  }
});


//edit Property's images 
router.post("/edit-land-image/:id", ensureAuthenticated, upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  
]), uploadMultipleLandImage, async (req, res) => {
try {
  const propertyId = req.params.id;

  const {
    imgResult,
    img2Result,
  } = req.uploadResults;

  if (!propertyId) {
    throw new TypeError("Invalid property ID");
  }

  const property_land = {};

  if (req.files['img']) {
      property_land.img = {
        url: imgResult.secure_url,
        publicId: imgResult.public_id,
      };
    }
    if (req.files['image']) {
      property_land.image = {
        url: imgResult.secure_url,
        publicId: imgResult.public_id,
      };
    }

  const filter = { _id: propertyId };
  const update = { $set: property_land };
  const options = { returnOriginal: false };

  const result = await Land.findOneAndUpdate(filter, update, options);

  if (!result) {
    return res.status(404).json({ error: "property_land not found" });
  }
  req.flash("success_msg", "Images Uploaded");
 
  return res.redirect('/admin/edit-land?id=' + propertyId);
} catch (error) {
  if (error.name === "CastError" || error.name === "TypeError") {
    return res.status(400).json({ error: error.message });
  }
  console.log(error);
  return res.status(500).send();
}
});
//done with Land Property


//creating BLOG 

const uploadMultipleBlogImage = async (req, res, next) => {
  try {
 

    const imgResult = await cloudinary.uploader.upload(req.files['img'][0].path);
    const img2Result = await cloudinary.uploader.upload(req.files['img2'][0].path);
 

    console.log('Cloudinary Upload Response:', imgResult);
    req.uploadResults = {
      imgResult,
      img2Result,
     
    };
    next();
 
  
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file to Cloudinary.');
  }
};
// 
router.post('/create-blog', ensureAuthenticated, upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img2', maxCount: 1 },
 
]), uploadMultipleBlogImage, async (req, res) => {
  try {
   

   const {fullname, category, article, topic} = req.body;
   const errors = [];
   
   const {
    imgResult,
    img2Result,
  } = req.uploadResults;

   if (!fullname || !category || !article || !topic) {
       errors.push( { msg : "Please fill in all the fields."} )
   }
   if (errors.length > 0) {
       res.render('create_blog', {
          errors: errors,
          fullname: fullname,
          category: category, 
          article: article, 
          topic: topic, 
          user: req.user,
       })
   } else{
      
      const blog = {
          fullname: fullname,
          category: category, 
          article: article, 
          topic: topic, 
          img: {},
          img2: {},
      } 

      
      if (req.files['img']) {
        blog.img = {
          url: imgResult.secure_url,
          publicId: imgResult.public_id,
        }
      }
      if (req.files['img2']) {
        blog.img2 = {
          url: img2Result.secure_url,
          publicId: img2Result.public_id,
        }
      }

      Blog.create(blog)
      .then((data) => {
         
          req.flash("success_msg", "Data Registered !");
          res.redirect('/admin/create-blog');
      }).catch((err) => {
          console.log(err)
      }).catch((err) => console.log (err))
  }

  } catch (error) {
       console.log (error)
  }
} )


//Edit Blog

router.post("/edit-blog-image/:id", upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img2', maxCount: 1 },
 
]), uploadMultipleBlogImage, async(req, res, next) => {
  try {
      const blogId = req.params.id;

      if (!blogId) {
        throw new TypeError("Invalid blog ID");
      }

      const {
        imgResult,
        img2Result,
      } = req.uploadResults;
  
      const blog = {};
  
      if (req.files['img']) {
        blog.img = {
          url: imgResult.secure_url,
          publicId: imgResult.public_id,
        }
      }
      if (req.files['img2']) {
        blog.img2 = {
          url: img2Result.secure_url,
          publicId: img2Result.public_id,
        }
      }
  
      const filter = { _id: blogId };
      const update = { $set: blog };
      const options = { returnOriginal: false };
  
      const results = await Blog.findOneAndUpdate(filter, update, options);
  
      if (!results) {
        return res.status(404).json({ error: "blog not found" });
      }
      req.flash("success_msg", "Images Uploaded");
      return res.redirect('/admin/edit-blog?id=' + blogId);
      
  } catch (error) {
      if (error.name === "CastError" || error.name === "TypeError") {
          return res.status(400).json({ error: error.message });
        }
        console.log(error);
        return res.status(500).send();
  }
} )

// blog Ending Here

//create ADMIN
// 
const uploads = multer({ dest: 'uploads/' });
const uploadAdminImage = uploads.single('img');

router.post('/create-admins',ensureAuthenticated, uploadAdminImage, async(req, res, next) => {
  try {
      const { first_name, second_name, position, password, password2, email, role} = req.body;
      const errors = [];

     const result = await cloudinary.uploader.upload(req.file.path);
    
     if (!result || !result.secure_url) {
      return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
    }
    
      if (!first_name || !second_name || !position || !password || !password2 || !email || !role) {
          errors.push( { msg : "Please fill in all fields." } );
      }
      if (password !== password2) {
          errors.push( { msg : "Password not match." } );
      }
      if (password.length < 8) {
          errors.push({ msg: "password atleast 8 character" });
        }
      if(errors.length > 0){
          res.render('create_admin', {
              errors: errors,
              first_name: first_name,
              second_name: second_name,
              position: position,
              role: role,
              password: password,
              password2: password2,
              email: email,
              user: req.user,
    
          } )
          
      }else{
          Admin.findOne( { email: email } )
                    .then((user) => {
             
              if(user) {
                  errors.push( { msg: "The email provided already associated with an existing User" } );
                  res.render('create_admin', {
                      errors: errors,
                      first_name: first_name,
                      second_name: second_name,
                      position: position,
                      role: role,
                      password: password,
                      password2: password2,
                      email: email,
                      user: req.user,
                  } )
                 
              }
              else if (!user) {
                    const newAdmin = new Admin ({
                        first_name: first_name,
                        second_name: second_name,
                        position: position,
                        role: role,
                        password: password,
                        password2: password2,
                        email: email,
                        img: {
                          url: result.secure_url,
                          publicId: result.public_id 
                            },
                    });
                    
                    bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newAdmin.password, salt,
                        (err, hash) => {
                            if (err) throw err;
      
                            newAdmin.password = hash;
      
                            newAdmin.save()
                                .then((value) => {
                                   
                                    req.flash(
                                      "success_msg",
                                      "An Admin Registered Successfully!"
                                    );
                                    res.redirect("/admin/create-admin");
                                    
                                })
                                .catch(err => {
                                    console.log(err)
                                    next(err)
                                })
                        })) 

    
              }
          }).catch((err) => {
                console.log(err);
                next(err)
          })
      }
  } catch (error) {
      console.log(error)
      next(error)
  }
});

// 

router.post("/edit-admin-image/:id", ensureAuthenticated, uploadAdminImage,  async(req, res, next) => {
  try {

    const result = await cloudinary.uploader.upload(req.file.path);
    if (!result || !result.secure_url) {
     return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
   }
      const id = req.params.id;
      Admin.findById(id).
                   then((admins) => {
                      admins.img = {
                        url: result.secure_url,
                        publicId: result.public_id 
                        };
              admins.save()
              .then((value) => {
                  console.log (value);
                  req.flash("success_msg", "Images Uploaded");
                  return res.redirect('/admin/edit-admin?id=' + id)
                  
              }).catch((err) => {
                  console.log (err);
                  res.json(err);
                  next(err);
              })
      }).catch((err) => {
       console.log(err);
       next(err);
      })
  } catch (error) {
      console.log (error)
  }
} );

//done Admin


//creating About/////////////////,,,,,,,,,,,,,,,...........................


const uploadMultipleAboutImage = async (req, res, next) => {
  try {
    console.log('Cloudinary Upload Request:', req.files)

    const imgResult = await cloudinary.uploader.upload(req.files['img'][0].path);
    const img2Result = await cloudinary.uploader.upload(req.files['img2'][0].path);
 

    console.log('Cloudinary Upload Response:', imgResult);
    req.uploadResults = {
      imgResult,
      img2Result,
     
    };
    next();
 
  
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file to Cloudinary.');
  }
};

router.post('/create-info',ensureAuthenticated,upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img2', maxCount: 1 },
 
]), uploadMultipleAboutImage, async(req, res, next) => {
  try {
      const {company_name, address, state,mobile,mobile2,mobile3,phone, email, heading, about, linkedin, facebook, instagram, twitter, whatsapp} = req.body;
      const errors = [];

      
   const {
    imgResult,
    img2Result,
  } = req.uploadResults;
    
      if (!company_name || !heading || !about || !mobile || !email) {
          errors.push( { msg : "Please fill in all fields." } );
      }
  
      if(errors.length > 0){
          res.render('create_info', {
              errors: errors,
              company_name: company_name,
              address: address,
              mobile: mobile,
              mobile2: mobile2,
              mobile3: mobile3,
              phone: phone,
              email: email,
              linkedin: linkedin,
              facebook: facebook,
              instagram: instagram, 
              twitter: twitter, 
              whatsapp: whatsapp,
              state: state,
              heading: heading,
              about: about,
              user: req.user,
          } )
      }else{
        About.findOne( { company_name : company_name} )
              .then( async (info) => {
                if (info) {
                  errors.push( { msg : "A Property already Exist with the Name Chosen." } );
                  res.render('create_info', {
                    errors: errors,
                    company_name: company_name,
                    address: address,
                    mobile: mobile,
                    mobile2: mobile2,
                    mobile3: mobile3,
                    phone: phone,
                    email: email,
                    linkedin: linkedin,
                    facebook: facebook,
                    instagram: instagram, 
                    twitter: twitter, 
                    whatsapp: whatsapp,
                    state: state,
                    heading: heading,
                    about: about,
                    user: req.user,
                } )
                }
                else {
                  const abouts = {
                    company_name: company_name,
                    address: address,
                    state: state,
                    mobile: mobile,
                    mobile2: mobile2,
                    mobile3: mobile3,
                    phone: phone,
                    email: email,
                    linkedin: linkedin,
                    facebook: facebook,
                    instagram: instagram, 
                    twitter: twitter, 
                    whatsapp: whatsapp,
                    heading: heading,
                    about: about,
                    img: {},
                    img2: {},
                  };

                 

                  if (req.files['img']) {
                   abouts.img = {
                      url: imgResult.secure_url,
                      publicId: imgResult.public_id,
                    }
                  }
                  if (req.files['img2']) {
                   abouts.img2 = {
                      url: img2Result.secure_url,
                      publicId: img2Result.public_id,
                    }
                  }
                  
                 await About.create(abouts)
                        .then((data) => {
                          req.flash("success_msg", "Data Registered !");
                          res.redirect('/admin/creating-info');
                        }).catch((err) => {
                          console.log(err)
                        })
                }
              })

      }
  } catch (error) {
      console.log(error)
      next(error)
  }
});


// Edit image for Info.

router.post("/edit-info-image/:id",ensureAuthenticated,upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img2', maxCount: 1 },
 
]),uploadMultipleAboutImage, async(req, res, next) => {
  try {
    const {
      imgResult,
      img2Result,
      // floorPlanResult,
      // videoResult,
    } = req.uploadResults;

    const infoId = req.params.id;

    if (!infoId) {
      throw new TypeError("Invalid info ID");
    }

    const info = {};

    if (req.files['img']) {
      info.img = {
         url: imgResult.secure_url,
         publicId: imgResult.public_id,
       }
     }
     if (req.files['img2']) {
      info.img2 = {
         url: img2Result.secure_url,
         publicId: img2Result.public_id,
       }
     }
    const filter = { _id: infoId };
    const update = { $set: info };
    const options = { returnOriginal: false };

    const result = await About.findOneAndUpdate(filter, update, options);

    if (!result) {
      return res.status(404).json({ error: "info not found" });
    }
    req.flash("success_msg", "Images Uploaded");
   return res.redirect('/admin/edit-info?id=' + infoId)
  } catch (error) {
    if (error.name === "CastError" || error.name === "TypeError") {
      return res.status(400).json({ error: error.message });
    }
    console.log(error);
    return res.status(500).send();
  }
} );

//ending info 


//creating STAFF-------------------------------

router.post('/create-staff', ensureAuthenticated,
uploadAdminImage, 
async (req, res, next) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
     
     if (!result || !result.secure_url) {
      return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
    }

   const {first_name, second_name, position, other_position, email, performance, phone, about,
    linkedin, facebook, instagram, twitter, whatsapp} = req.body;
   const errors = [];

   if (!first_name || !second_name || !email || !performance || !about || !phone || !whatsapp) {
       errors.push( { msg : "Please fill in all the fields."})
   }
   if (errors.length > 0) {
       res.render('create_staff', {
           errors: errors,
           first_name: first_name,
           second_name: second_name,
           position: position,
           other_position: other_position,
           email : email,
           performance : performance,
           about:  about,
           phone: phone,
           linkedin: linkedin,
           facebook: facebook,
           instagram: instagram, 
           twitter: twitter, 
           whatsapp: whatsapp,
           user: req.user,
       })
   } else {
       Staff.findOne( { email: email } )
            .then((user) => {
           if(user) {
               errors.push( { msg: "The email provided already associated with an existing User" })
               res.render('create_staff', {
                errors: errors,
                first_name: first_name,
                second_name: second_name,
                position: position,
                other_position: other_position,
                email : email,
                performance : performance,
                about:  about,
                phone: phone,
                linkedin: linkedin,
                facebook: facebook,
                instagram: instagram, 
                twitter: twitter, 
                whatsapp: whatsapp,
                user: req.user,
               })
           }else if(!user){
               const newStaff = new Staff ({
                first_name: first_name,
                second_name: second_name,
                position: position,
                other_position: other_position,
                email : email,
                performance : performance,
                about:  about,
                phone: phone,
                linkedin: linkedin,
                facebook: facebook,
                instagram: instagram, 
                twitter: twitter, 
                whatsapp: whatsapp,
                   img : {
                    url: result.secure_url,
                    publicId: result.public_id 
                      },
               }) 

               newStaff
                   .save()
                   .then((value) => {
                        req.flash("success_msg", "Data Registered !");
                        res.redirect('/admin/create-staff');
                   }).catch((err) =>{
                     console.log (err)
                     next(err)
                    })
           }
       }).catch((err) => {
        console.log(err);
        next(err);
       })
   }

  } catch (error) {
       console.log (error);
       next(error);
  }
} )

// editting staffs image

router.post("/edit-staff-image/:id",  uploadAdminImage, async(req, res, next) => {
    try {

      const result = await cloudinary.uploader.upload(req.file.path);
      if (!result || !result.secure_url) {
       return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
     }

        const id = req.params.id;
        Staff.findById(id).
                     then((staffs) => {
                        staffs.img = img = {
                          url: result.secure_url,
                          publicId: result.public_id 
                          };
                staffs.save()
                .then((value) => {
                  req.flash("success_msg", "Images Uploaded");
                    return res.redirect('/admin/edit-staff?id=' + id)
                }).catch((err) => {
                    console.log (err);
                    res.json(err);
                    next(err);
                })
        }).catch((err) => {
         console.log(err);
         next(err);
        })
    } catch (error) {
        console.log (error)
    }
 } );

//creating Service----------------------------------

const uploadMultipleServiceImage = async (req, res, next) => {
  try {
    console.log('Cloudinary Upload Request:', req.files)

    const imgResult = await cloudinary.uploader.upload(req.files['img'][0].path);
    const img2Result = await cloudinary.uploader.upload(req.files['img2'][0].path);

    req.uploadResults = {
      imgResult,
      img2Result,
    };
    next();
  
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file to Cloudinary.');
  }
};

router.post('/create-service',ensureAuthenticated, upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img2', maxCount: 1 },
 
]), uploadMultipleServiceImage, async(req, res, next) => {
  try {
    const {
      imgResult,
      img2Result,
      // floorPlanResult,
      // videoResult,
    } = req.uploadResults;

      const { heading, about} = req.body;
      const errors = [];
    
      if (!heading || !about ) {
          errors.push( { msg : "Please fill in all fields." } );
      };
  
      if(errors.length > 0){
          res.render('create_service', {
              errors: errors,
              heading: heading,
              about: about,
              user: req.user,
          } )
      } else {
        Service.findOne( { heading: heading } )
                .then((serv) => {
                  if(!serv) {
                    const ourServ = {
                      heading: heading,
                      about: about,
                      img: {},
                      img2: {},
                    }; 

                    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

                    if (req.files['img']) {
                      ourServ.img = {
                         url: imgResult.secure_url,
                         publicId: imgResult.public_id,
                       }
                     }
                     if (req.files['img2']) {
                      ourServ.img2 = {
                         url: img2Result.secure_url,
                         publicId: img2Result.public_id,
                       }
                     }
                    Service.create(ourServ)
                    .then((data) => {
                      req.flash("success_msg", "Data Registered !");
                      res.redirect("/admin/creating-service")
                    }).catch((err) => {
                      console.log(err)
                    })
                    
                  }else {
                  
                   res.status(404).send({ message: "Service created with the same heading already created"})
                  }
                 
                }
               
                )

      }
  } catch (error) {
      console.log(error)
      next(err)
  }
});



router.post("/edit-service-image/:id", upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img2', maxCount: 1 },
 
]),  uploadMultipleServiceImage, async(req, res, next) => {
 try {
  const {
    imgResult,
    img2Result,
    // floorPlanResult,
    // videoResult,
  } = req.uploadResults;
  
   const servId = req.params.id;
   if(!servId) {
    throw new TypeError('Invalid Service ID');
   }

   const serv = {};
   
   if (req.files['img']) {
    serv.img = {
       url: imgResult.secure_url,
       publicId: imgResult.public_id,
     }
   }
   if (req.files['img2']) {
    serv.img2 = {
       url: img2Result.secure_url,
       publicId: img2Result.public_id,
     }
   }
  const filter = { _id: servId };
  const update = { $set: serv };
  const options = { returnOriginal: false };

  const result = await Service.findOneAndUpdate(filter, update, options)
  if (!result) {
    return res.status(404).json({ error: "info not found" });
  }

  req.flash("success_msg", "Images Uploaded");
  return res.redirect('/admin/edit-service?id=' + servId)
 } catch (error) {
   if (error.name === "CastError" || error.name === "TypeError") {
      return res.status(400).json({ error: error.message });
    }
    console.log(error);
    return res.status(500).send();
 }
} );
//Done with Service'/////////////////////////......................................





//  contact page image


router.post('/contact_image', ensureAuthenticated, uploadAdminImage, async(req, res, next) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
   
     if (!result || !result.secure_url) {
      return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
    }

  const {message} = req.body;
  const errors = [];  
  if(!message) {
    errors.push( { msg : "Please fill in all the fields."})
  }
  if(errors.length > 0) {
    res.render('creat_contact_image', {
      errors: errors,
      message: message,
      user: req.user,
    })
  }else {
    const newImageContact = new ImageContact ({
      message : message,
      img: {
        url: result.secure_url,
        publicId: result.public_id 
          },
    });

    newImageContact
            .save()
            .then((value) => {
              req.flash("success_msg", "Data updated !");
              res.redirect('/admin/create-contact-image');
            }).catch((err) =>{
              console.log (err)
              next(err)
             })
  }
  } catch (error) {
    console.log(error);
    next(error);
  }
})

//Contact Ending



//------------------------Mission-------------------------------------//


router.post('/create-vision', ensureAuthenticated, uploadAdminImage, async(req, res, next) => {
  try {

    const result = await cloudinary.uploader.upload(req.file.path);
     
      if (!result || !result.secure_url) {
       return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
     }

  const { vision, heading} = req.body;
  const errors = [];  
  if(!vision || !heading) {
    errors.push( { msg : "Please fill in all the fields."})
  }
  if(errors.length > 0) {
    res.render('creat_vision', {
      errors: errors,
      vision: vision,
      heading: heading,
      user: req.user,
    })
  }else {
    const vis = new Vision ({
      vision: vision,
      heading: heading,
        img: {
                          url: result.secure_url,
                          publicId: result.public_id 
                            },
    });

         vis
            .save()
            .then((value) => {
              req.flash("success_msg", "Data updated !");
              res.redirect('/admin/create-vision');
            }).catch((err) =>{
              console.log (err)
              next(err)
             })
  }
  } catch (error) {
    console.log(err);
    next(err);
  }
})




//------------------------------End ----------------------------//


//------------------------Vision-------------------------------------//

router.post('/create-mission',ensureAuthenticated, uploadAdminImage, async(req, res, next) => {
  try {

    const result = await cloudinary.uploader.upload(req.file.path);
   
     if (!result || !result.secure_url) {
      return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
    }

  const { mission, heading } = req.body;
  const errors = [];  
  if(!mission || !heading) {
    errors.push( { msg : "Please fill in all the fields."})
  }
  if(errors.length > 0) {
    res.render('creat_mission', {
      errors: errors,
      mission:  mission,
      heading: heading,
      user: req.user,
    })
  }else {
    const mis = new Mission ({
      mission:  mission,
      heading: heading,
      img: {
        url: result.secure_url,
        publicId: result.public_id 
          },
    });

       await  mis
            .save()
            .then((value) => {
              req.flash("success_msg", "Data updated !");
              res.redirect('/admin/create-mission');
            }).catch((err) =>{
              console.log (err)
              next(err)
             })
  }
  } catch (error) {
    console.log(err);
    next(err);
  }
})

//ending Vission

//Getting housing
router.get("/housing/:page", ensureAuthenticated, async(req, res, next) => {
  try {
    var perPage = 10;
    var page = req.params.page || 1;
  
   await Property
      .find()
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .then((prop) => {
        Property
            .count()
            .then((count) => {
          res.render('housing', {
            prop: prop,
            user: req.user,
            current: page,
            pages: Math.ceil(count / perPage)
          });
        }).catch((err) => {
            console.log(err)
            next(err)
        });
      }).catch((err) => {
        console.log(err)
        next(err)
        }) ;
  } catch (error) {
    console.log(error)
  }
   
})


router.get('/edit-property', ensureAuthenticated, async(req, res) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
            await Property.findById(id)
                    .then((prop) => {
                        if (!prop) {
                            res
                            .status(404)
                            .send({ message: "Oop! Property not found" } )
                        }else {
                            res
                            .render(
                                "edit-property", 
                                {
                                    prop: prop,
                                    user: req.user,
                                }
                                )
                        }
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
});

router.delete("/delete-property/:id", async(req, res) => {
  const id = req.params.id;
    await Property.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
   
});

router.get('/view-detail-house', ensureAuthenticated, async(req, res) => {
  if (req.query.id) {
      try {
          const id = req.query.id;
        await Property.findById(id)
                  .then((land) => {
                      if (!land) {
                          res
                          .status(404)
                          .send({ message: "Oop! Property not found" } )
                      }else {
                          res
                          .render(
                              "view_house", 
                              {
                                  land: land,
                                  user: req.user,
                              }
                              )
                      }
                      
                  }).catch((err) => {
                      res
                      .json(err)
                  })
      } catch (error) {
          console.log(error)
      }
  }
});

  //Editting Properties
  router.post("/edit-property/:id", async (req, res) => {
    try {
      const propertyId = req.params.id;
      if (!propertyId) {
        throw new TypeError("Invalid property ID");
      }
  
      const property = {
        name: req.body.name,
        location: req.body.location,
        status: req.body.status,
        area: req.body.area,
        bed: req.body.bed,
        baths: req.body.baths,
        garage: req.body.garage,
        price: req.body.price,
        amenities: req.body.amenities.split("  ").map(function (amenity) {
          return amenity.trim();
        }),
        description: req.body.description,
        period: req.body.period,
      };
  
      const filter = { _id: propertyId };
      const update = { $set: property };
      const options = { returnOriginal: false };
  
      const result = await Property.findOneAndUpdate(filter, update, options);
  
      if (!result) {
        return res.status(404).json({ error: "Property not found" });
      }
  
      return res.json("Successfully updated property");
    } catch (error) {
      if (error.name === "CastError" || error.name === "TypeError") {
        return res.status(400).json({ error: error.message });
      }
      console.log(error);
      return res.status(500).send();
    }
  });
  


//Lands
router.get("/land/:page", ensureAuthenticated, async(req, res, next) => {
    try {
      var perPage = 10;
      var page = req.params.page || 1;
    
await Land
        .find()
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .then((land) => {
          Land
              .count()
              .then((count) => {
            res.render('land', {
              land: land,
              current: page,
              user: req.user,
              pages: Math.ceil(count / perPage)
            });
          }).catch((err) => {
              console.log(err)
              next(err)
          });
        }).catch((err) => {
          console.log(err)
          next(err)
          }) ;
    } catch (error) {
      console.log(error)
    }
     
  });


router.get('/edit-land', ensureAuthenticated, async(req, res) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
           await Land.findById(id).select("land_id name status area period location")
                    .then((land) => {
                        if (!land) {
                            res
                            .status(404)
                            .send({ message: "Oop! Property not found" } )
                        }else {
                            res
                            .render(
                                "edit_land", 
                                {
                                    land: land,
                                    user: req.user,
                                }
                                )
                        }
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
});

//Editting land Properties
router.post("/edit-land/:id", async (req, res) => {
    try {

      const propertyId = req.params.id;

      if (!propertyId) {
        throw new TypeError("Invalid property ID");
      }
  
      const property = {
        name: req.body.name,
        location: req.body.location,
        status: req.body.status,
        area: req.body.area,
        price: req.body.price,
        amenities: req.body.amenities.split("  ").map(function (amenity) {
          return amenity.trim();
        }),
        description: req.body.description,
        period: req.body.period,
      };
  
      const filter = { _id: propertyId };
      const update = { $set: property };
      const options = { returnOriginal: false };
  
  const result = await Land.findOneAndUpdate(filter, update, options);
  
      if (!result) {
        return res.status(404).json({ error: "Property not found" });
      }
  
      return res.json("Successfully updated property");
    } catch (error) {
      if (error.name === "CastError" || error.name === "TypeError") {
        return res.status(400).json({ error: error.message });
      }
      console.log(error);
      return res.status(500).send();
    }
  });

router.get('/view-detail-land', ensureAuthenticated, async(req, res) => {
  if (req.query.id) {
      try {
          const id = req.query.id;
         await Land.findById(id)
                  .then((land) => {
                      if (!land) {
                          res
                          .status(404)
                          .send({ message: "Oop! Property not found" } )
                      }else {
                          res
                          .render(
                              "view_land", 
                              {
                                  land: land,
                                  user: req.user,
                              }
                              )
                      }
                      
                  }).catch((err) => {
                      res
                      .json(err)
                  })
      } catch (error) {
          console.log(error)
      }
  }
});

//deleting Land
router.delete("/delete-land/:id", async(req, res) => {
  const id = req.params.id;
    await Land.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
   
});


//Blogs
router.get("/blog/:page", ensureAuthenticated, async(req, res, next) => {
    try {
      var perPage = 10;
      var page = req.params.page || 1;
    
    await Blog
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .then((blog) => {
          Blog
              .count()
              .then((count) => {
            res.render('blog', {
              blog: blog,
              current: page,
              user: req.user,
              pages: Math.ceil(count / perPage)
            });
          }).catch((err) => {
              console.log(err)
              next(err)
          });
        }).catch((err) => {
          console.log(err)
          next(err)
          }) ;
    } catch (error) {
      console.log(error)
    }
     
  });


router.get('/edit-blog', ensureAuthenticated, async(req, res) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
           await Blog.findById(id)
                    .then((blog) => {
                        if (!blog) {
                            res
                            .status(404)
                            .send({ message: "Oop! Property not found" } )
                        }else {
                            res
                            .render(
                                "edit_blog", 
                                {
                                    blog: blog,
                                    user: req.user,
                                }
                                )
                        }
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
});

// editting blog
router.post("/edit-blog/:id", async(req, res, next) => {
  try {
     const {fullname, category, article, topic} = req.body;
      const blogId = req.params.id;
      if (!blogId) {
       throw new TypeError("Invalid blog ID");
     }

     const blog = {
       fullname: fullname,
       category: category, 
       article: article, 
       topic: topic, 
   };

     const filter = { _id: blogId };
     const update = { $set: blog };
     const options = { returnOriginal: false };

  const result = await Blog.findOneAndUpdate(filter, update, options);
   
     if (!result) {
       return res.status(404).json({ error: "Blog not found" });
     }
 
     return res.json("Successfully updated Blog");
   
  } catch (error) {
   if (error.name === "CastError" || error.name === "TypeError") {
       return res.status(400).json({ error: error.message });
     }
      console.log (error);
      return res.status(500).send();
  }
} )

 //deleting blog
 router.delete("/delete-blog/:id", async(req, res) => {
  const id = req.params.id;
    await Blog.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong or not found` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
   
});


//admin
router.get("/admin/:page", ensureAuthenticated, async(req, res, next) => {
    try {
      var perPage = 10;
      var page = req.params.page || 1;
    
     await Admin
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .then((admin) => {
          Admin
              .count()
              .then((count) => {
            res.render('admin', {
              admin: admin,
              current: page,
              user: req.user,
              pages: Math.ceil(count / perPage)
            });
          }).catch((err) => {
              console.log(err)
              next(err)
          });
        }).catch((err) => {
          console.log(err)
          next(err)
          }) ;
    } catch (error) {
      console.log(error)
    }
     
  });


router.get('/edit-admin', ensureAuthenticated, async(req, res) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
         await Admin.findById(id)
                    .then((admin) => {
                        if (!admin) {
                            res
                            .status(404)
                            .send({ message: "Oop! Property not found" } )
                        }else {
                            res
                            .render(
                                "edit_admin", 
                                {
                                    admin: admin,
                                    user: req.user,
                                }
                                )
                        }
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
});

// Editting Admin
router.post("/edit-admin/:id", async(req, res, next) => {
  try {
      const id = req.params.id;
      const { first_name, second_name, position, password, email, role} = req.body;

      await Admin.findById(id)
                .then((user) => {
          user.first_name = first_name;
          user.second_name = second_name;
          user.position = position;
          user.email = email;
          user.role = role;
          user
              .save()
              .then((user) => {
                  res.json("User updated!")
              }).catch((err) =>{ 
              console.log (err)
                next(err)
            })
      }).catch((err) => {
        console.log(err);
        next(err)
      })
      
  } catch (error) {
      console.log (error)
  }
} );

router.patch('/admin-status/:id', async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  try {
    const switchDoc = await Admin.findByIdAndUpdate(id, { status }, { new: true });
    if (!switchDoc) return res.status(404).send('switch not found');
    res.send(switchDoc);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/delete-admin/:id", async(req, res) => {
  const id = req.params.id;
    await Admin.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong or not found` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
   
});


//staff
router.get("/staff/:page", ensureAuthenticated, async(req, res, next) => {
    try {
      var perPage = 10;
      var page = req.params.page || 1;
    
      Staff
        .find()
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .then((staff) => {
          Staff
              .count()
              .then((count) => {
            res.render('staff', {
              staff: staff,
              current: page,
              user: req.user,
              pages: Math.ceil(count / perPage)
            });
          }).catch((err) => {
              console.log(err)
              next(err)
          });
        }).catch((err) => {
          console.log(err)
          next(err)
          }) ;
    } catch (error) {
      console.log(error)
    }
     
  });


router.get('/edit-staff', ensureAuthenticated, async(req, res) => {
    if (req.query.id) {
        try {
            const id = req.query.id;
            Staff.findById(id)
                    .then((staff) => {
                        if (!staff) {
                            res
                            .status(404)
                            .send({ message: "Oop! Property not found" } )
                        }else {
                            res
                            .render(
                                "edit_staff", 
                                {
                                    staff: staff,
                                    user: req.user,
                                }
                                )
                        }
                        
                    }).catch((err) => {
                        res
                        .json(err)
                    })
        } catch (error) {
            console.log(error)
        }
    }
});

router.post("/edit-staff/:id", async(req, res, next) => {
  try {
    
      const id = req.params.id;
      const { 
        first_name, 
        second_name,
        position,
        other_position,
        email,
        performance,
        about,
        phone,
        linkedin,
        facebook,
        instagram, 
        twitter, 
        whatsapp,} = req.body;

      Staff.findById(id)
            .then((user) => {
              user.first_name = first_name;
              user.second_name = second_name;
              user.position = position;
              user.other_position = other_position;
              user.email  = email;
              user.performance  = performance;
              user.about =  about;
              user.phone = phone;
              user.linkedin = linkedin;
              user.facebook = facebook;
              user.instagram = instagram; 
              user.twitter = twitter; 
              user.whatsapp = whatsapp;
          user
              .save()
              .then((user) => {
                  res.json("User Update")
              }).catch((err) => {
                  console.log (err)
                  res.json(err)
                  next(err)
              })
      }).catch((err) => {
        console.log(err);
        next(err);
      })
  } catch (error) {
      console.log (err)
  }
} );

// staffs detail
router.get("/staff-detail", ensureAuthenticated, async (req, res, next) => {
    try {
        if(req.query) {
            const id = req.query.id;

            await Staff.findById(id)
                        .then((staff) => {
                            Property.find()
                                    .then((prop) => {
                                        Land.find()
                                            .then((land) => {
                                                res.render("staffs_detail", {
                                                    staff: staff,
                                                    land: land,
                                                    prop: prop,
                                                    user: req.user,
                                                })
                                            }).catch((err) => {
                                                console.log(err)
                                                next(err)
                                            })
                                    }).catch((err) => {
                                        console.log(err)
                                        next(err)
                                    })
                            
                        }).catch((err) => {
                            console.log(err)
                            next(err)
                        })
        }
    } catch (error) {
        console.log(error)
        next(err)
    }
})



// -------------Staff Statusm---------------------//
router.patch('/staff-status/:id', async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  try {
    const switchDoc = await Staff.findByIdAndUpdate(id, { status }, { new: true });
    if (!switchDoc) return res.status(404).send('switch not found');
    res.send(switchDoc);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// ------------managing team --------------------//
router.patch('/managing-status/:id', async (req, res) => {
  const id = req.params.id;
  const { managingStatus } = req.body;

  try {
    const switchManaging = await Staff.findByIdAndUpdate(id, { managingStatus }, { new: true });
    if (!switchManaging) return res.status(404).send('switch not found');
    res.send(switchManaging);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//deleting staff
router.delete("/delete-staff/:id", async(req, res) => {
  const id = req.params.id;
    await Staff.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong or not found` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
   
});

//assigning land and house to staff

router.post("/assign-house/:id", async (req, res) => {
    const { filterOption } = req.body;
    const id = req.params.id;
  
    try {
      const staff = await Staff.findById(id);
   
      staff.propid.push(filterOption);
      const updateStaff = await staff.save();
  
      res.redirect(`/admin/staff-detail?id=${id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });
  

router.post("/assign-land/:id" , async (req, res) => {

        const { filterOptions } = req.body;
        const id = req.params.id;
    try {
        

       const staff = await Staff.findById(id);
   
      staff.landid.push(filterOptions);
      const updateStaff = await staff.save();
  
      res.redirect(`/admin/staff-detail?id=${id}`);
    } catch (error) {
        console.error(erorr);
        res.status(500).send("Server error");
    }
})

//edit info
router.get("/creating-info", ensureAuthenticated, async (req, res) => {
  try {
    await res.render("create_info",   {
      user: req.user
      
    })
  } catch (error) {
    console.log(error)
  }
})

router.get('/edit-info', ensureAuthenticated, async(req, res) => {
  if (req.query.id) {
      try {
          const id = req.query.id;
          About.findById(id)
                  .then((service) => {
                     
                          res
                          .render(
                              "edit_info", 
                              {
                                  service: service,
                                  user: req.user,
                              }
                              )
                     
                      
                  }).catch((err) => {
                      res
                      .json(err)
                  })
      } catch (error) {
          console.log(error)
      }
  }
});


router.post("/edit-infor/:id", async (req, res) => {
  const id = req.params.id;
  const {company_name, address, state, heading, about, mobile, mobile2, 
    mobile3, email, phone, linkedin, facebook, instagram, twitter, whatsapp, } = req.body;
  
  try {
    await About.updateOne({ _id: id}, {$set: { 
      mobile: mobile, 
      mobile2: mobile2, 
      mobile3: mobile3, 
      company_name: company_name, 
      address: address, 
      state : state, 
      heading: heading, 
      about: about, 
      phone: phone, 
      email: email,
      linkedin: linkedin,
      facebook: facebook,
      instagram: instagram, 
      twitter: twitter, 
      whatsapp: whatsapp,
    }
  })
    res.redirect(`/admin/edit-info?id=${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
})


//edit service

router.get("/creating-service", ensureAuthenticated, async (req, res) => {
  try {
    await res.render("create_service", {
      user: req.user,
    })
  } catch (error) {
    console.log(error)
  }
});

router.get('/edit-service', ensureAuthenticated, async(req, res) => {
  if (req.query.id) {
      try {
          const id = req.query.id;
          Service.findById(id)
                  .then((service) => {
                     
                          res
                          .render(
                              "edit_service", 
                              {
                                  service: service,
                                  user: req.user,
                                  
                              }
                              )
                     
                      
                  }).catch((err) => {
                      res
                      .json(err)
                  })
      } catch (error) {
          console.log(error)
      }
  }
});


router.post("/edit-service/:id", async (req, res) => {
  const id = req.params.id;
  const {heading, about} = req.body;
  
  try {
    await Service.updateOne({ _id: id}, {$set: {heading: heading, about: about}})
    res.redirect(`/admin/edit-service?id=${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

//delete each assignment
router.get("/delete-propid/:id", ensureAuthenticated, async (req, res) => {
  const staffId = req.params.id;
  const propNameToRemove = req.query.prop;

  try {
    await Staff.updateOne({ _id: staffId }, { $pull: { propid: propNameToRemove } });
    console.log(`Removed ${propNameToRemove} from staff member ${staffId}`);
    res.redirect(`/admin/staff-detail?id=${staffId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/delete-landid/:id", ensureAuthenticated, async (req, res) => {
  const staffId = req.params.id;
  const propNameToRemove = req.query.land;

  try {
    await Staff.updateOne({ _id: staffId }, { $pull: { landid: propNameToRemove } });
    console.log(`Removed ${propNameToRemove} from staff member ${staffId}`);
    res.redirect(`/admin/staff-detail?id=${staffId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/contact/:page", ensureAuthenticated, async(req, res, next) => {
  try {
    var perPage = 10;
    var page = req.params.page || 1;

    await Contact
                  .find()
                  .sort({ createdAt : -1})
                  .skip((perPage * page) - perPage)
                  .limit(perPage)
                  .then((contact) => {
                    Contact
                      .count()
                      .then((count) => {
                        res.render("contact_list", {
                          contact: contact,
                          current: page,
                          user: req.user,
                          pages: Math.ceil(count / perPage)
                        });
                      }).catch((err) => {
                        console.log(err)
                        next(err)
                      })
                  })
  } catch (error) {
    console.log(error)
  }
});

router.get("/contact-read", ensureAuthenticated, async (req, res) => {
  const id = req.query.id;

  try {
    await Contact.updateOne({ _id: id }, { $set: { isRead: true } });
    const contact = await Contact.findById(id);
    res.render("inbox", {
      contact,
      user: req.user,
    });
  } catch (error) {
    console.log(error);
  }
});

router.delete("/delete-contact/:id", async(req, res) => {
  const id = req.params.id;
    await Contact.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
   
});




//Nodemailer
router.get('/email_subscriber', ensureAuthenticated, async(req, res) => {
  await res.render('subcriber_message', {
    user: req.user,
  })
})

router.get('/replying', ensureAuthenticated, async(req, res) => {
  const id = req.query.id;
  try {
    const contact = await Contact.findById(id);

    res.render("reply_single", {
      contact,
      user: req.user,
    });
  
  } catch (error) {
    console.log(error);
  }
})

// Manage password changing

router.get('/change-password',ensureAuthenticated, async (req, res) => {
  try {
    await 
    res.render('change_password', {
      user: req.user,
    })
  } catch (error) {
    console.log(error)
  }
})

router.post('/password', ensureAuthenticated, async(req, res) => {

  const {passwords, email, passwording} = req.body;
  let errors = [];

  if (!passwords || !email || !passwording) {
    errors.push( { msg: "Please fill in the field"} );
  }

  if ( passwording.length < 6) {
    errors.push({ msg: "password atleast 6 character" });
  }

  if ( passwords.length < 6) {
    errors.push({ msg: "Your previous password is incorrect!" });
  }

  if ( passwording == passwords) {
    errors.push({ msg: "Password provided are the same use different password" });
  }
  if (errors.length > 0) {

      res.render('change_password', {
        errors: errors,
        email: email,
        passwords : passwords,
        passwording: passwording,
      
      })
   
  
  } else{
    Admin.findOne({ email : email}).then((user) => {

      if (!user) {
            errors.push( { msg : "Oops! no User associated with that email"});
              res.render('change_password', {
                errors: errors,
                email: email,
                passwords : passwords,
                passwording: passwording,
               
              })
            
      } if(user) {
       Admin.find({password : passwords})
    
        .then((user)=> {
          if(!user){
            errors.push( { msg : "Oops! Password Incorrect"});
              res.render('change_password', {
                errors: errors,
                email: email,
                passwords : passwords,
                passwording: passwording,
               
              })
           
        }else {
         Admin.findOne({ email : email})
            .then((user) => {
              user.password = passwording;
              bcrypt.genSalt(10, (err, salt) =>
              bcrypt.hash(user.password, salt,
                  (err, hash) => {
                      if (err) throw err;

                      user.password = hash;

                      user
                      .save()
                          .then((value) => {
                              console.log(value)
                              req.flash(
                                "success_msg",
                                "Password Changed Successfully!"
                              );
                              res.redirect(`/admin/change-password`);
                          })
                          .catch(value => console.log(value))
                  }))
             
            })
        }})
                  

      }
    }).catch((err) => {
      console.log(err)
    })
              
  }
  

    
})


// Reovering password Settings .............................

router.get('/forget-password', async (req, res) => {
  try {
    await 
    res.render('forget_password')
  } catch (error) {
    console.log(error)
  }
});

router.post('/password-new', async (req, res) => {
  const { email } = req.body;
  let errors = [];

  if (!email) {
    errors.push({ msg: "Please fill in the field" });
  }

  if (errors.length > 0) {
    res.render('forget_password', {
      errors: errors,
      email: email,
    })
  } else {
    try {
      const user = await Admin.findOne({ email: email });
      if (!user) {
        errors.push({ msg: "Oops! no User associated with that email" });
        res.render('forget_password', {
          errors: errors,
          email: email,
        });
      } else {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let voucherCode = '';
        for (let i = 0; i < 6; i++) {
          voucherCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        const code = await new Recovery({ recovery: "onetimepass-"+voucherCode }).save();
        const html = `
          <html>
            <head>
              <style>
                /* Define your CSS styles here */
                body {
                  font-family: Arial, sans-serif;
                  font-size: 16px;
                  color: #333;
                }
                h2 {
                  color: #ff0000;
                }
                p {
                  line-height: 1.5;
                }
              </style>
            </head>
            <body>
              <img src="/assets/img/Valiant-01.png" alt="Company Logo">
              <h2>Valiantfoot Recovery Code</h2>
              <p>${code.recovery}</p>
            </body>
          </html>
        `;
        const mailOptions = {
          from: 'Valiantfoot@gmail.com',
          to: user.email,
          subject: 'Use the below Code to recover your Password',
          html: html
        };
        const smtpConfig = {
          host: 'smtp.gmail.com',
          port: 465,
          auth: {
            user: 'Valiantfoot@gmail.com',
            pass: PASSWORD_EMAIL,
          },
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateDelta: 1000,
          rateLimit: 1000,
        };
        const transporter = nodemailer.createTransport(smtpPool(smtpConfig));
        await transporter.sendMail(mailOptions);
        req.flash('success_msg', 'Recovery Code sent to the Email you provided');
        res.redirect('/admin/recover-password');
      }
    } catch (err) {
      console.log(err);
      res.render('forget_password', {
        errors: [{ msg: "An error occurred while processing your request. Please try again later." }],
        email: email,
      });
    }
  }
});


//code from Email

router.get('/recover-password', async (req, res) => {
  try {
    await 
    res.render('recover_password')
  } catch (error) {
    console.log(error)
  }
});

router.post('/password-reset', async(req, res) => {
  const { email, recoveryCode, newPassword } = req.body;
  let errors = [];

  if (!email || !recoveryCode || !newPassword) {
    errors.push( { msg: "Please fill in all fields"} );
  }

  if (errors.length > 0) {
    res.render('recover_password', {
      errors: errors,
      email: email,
      recoveryCode: recoveryCode,
      newPassword: newPassword,
    });
  } else {
    // Find the recovery code in the database
    await Recovery.findOne({ recovery: recoveryCode }).then((recovery) => {
      if (!recovery) {
        // If the recovery code doesn't exist, show an error message
        errors.push( { msg : "Invalid recovery code"});
        res.render('recover_password', {
          errors: errors,
          email: email,
          recoveryCode: recoveryCode,
          newPassword: newPassword,
        });
      } else if (recovery.isUsed == true) {
        // If the recovery code has already been used, show an error message
        errors.push( { msg : "This recovery code has already been used."});
        res.render('recover_password', {
          errors: errors,
          email: email,
          recoveryCode: recoveryCode,
          newPassword: newPassword,
        });
      } else {
        // If the recovery code exists and hasn't been used, update the admin's password in the database
        Admin.findOne({ email: email }).then((admin) => {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newPassword, salt, (err, hash) => {
              if (err) throw err;
              admin.password = hash;
              admin.save().then(() => {
                // Update the recovery code in the database to show that it has been used
                recovery.isUsed = true;
                recovery.save().then(() => {
                  req.flash('success_msg', 'Your password has been reset. Please log in.');
                  res.redirect('/admin/login');
                });
              });
            });
          });
        });
      }
    }).catch((err) => {
      console.log(err)
    });
  }
});

router.get('/career-builder', ensureAuthenticated, async(req, res) => {
  try {
    await res.render("careerAdmin", { user: req.user })
  } catch (error) {
    console.log(error)
  }
});

router.post('/create-job', async(req, res) => {
  try {
    const {jobName, jobDescription } = req.body

    const errors = []
    if(!jobName || !jobDescription) {
      errors.push({ msg: "Please fill in all fields." });
    }
    if(errors.length > 0) {
      res.render('', {
        errors: errors,
        jobName: jobName,
        jobDescription: jobDescription,
        
      });
    } else {
      const JobName =  {
        jobName: jobName,
        jobDescription: jobDescription.split('  ').map(jobDescription => jobDescription.trim()),
      };

      CareerCreation.create(JobName)
                      .then((data) => {
                        req.flash("success_msg", "Job Registered !");
                        res.redirect('/admin/career-builder');
                      }).catch((err) => {
                        console.log(err)
                      })
    }
  } catch (error) {
    console.log(error);
  }
}  )


router.get('/alljobs/:page', ensureAuthenticated, async(req, res) => {
  try {
    var perPage = 10;
    var page = req.params.page || 1;
    
await CareerCreation
                    .find()
                    .skip((perPage * page) - perPage)
                    .limit(perPage)
                    .then((career) => {
                      CareerCreation
                                  .count()
                                  .then((count) => {
                                    res.render('allJob', {
                                      career: career,
                                      current: page,
                                      user: req.user,
                                      pages: Math.ceil(count / perPage)
                                    });
                                  }).catch((err) => {
                                    console.log(err)
                                    next(err)
                                  })
                    });

   
  } catch (error) {
    console.log(error);
  }
})

router.delete("/delete-career/:id", async(req, res) => {
  const id = req.params.id;
    await CareerCreation.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. May be id is wrong` });
      } else {
        res.send({
          message: "Data was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Data with id=" + id + "with err:" + err,
      });
    });
   
});


router.get('/edit-career', ensureAuthenticated, async(req, res) => {
  if (req.query.id) {
      try {
          const id = req.query.id;
          await CareerCreation.findById(id)
                  .then((career) => {
                     
                          res
                          .render(
                              "edit-jobs", 
                              {
                                  career: career,
                                  user: req.user,
                                  
                              }
                              )
                     
                      
                  }).catch((err) => {
                      res
                      .json(err)
                  })
      } catch (error) {
          console.log(error)
      }
  }
});


router.post("/edit-career/:id", async (req, res) => {
  const id = req.params.id;
  const {jobName, jobDescription} = req.body;
  
  try {
    await CareerCreation.updateOne({ _id: id}, {$set: {jobName: jobName, jobDescription: jobDescription.split('  ').map(jobDescription => jobDescription.trim()), }})
    res.redirect(`/admin/edit-career?id=${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.patch('/career-status/:id', async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  try {
    const switchDoc = await CareerCreation.findByIdAndUpdate(id, { status }, { new: false });
    if (!switchDoc) return res.status(404).send('switch not found');
    res.send(switchDoc);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


//---------------------Vision-----------------------//
router.get('/create-vision',  ensureAuthenticated, async(req, res) => {
  await res.render('create_vision', { user : req.user})
})

//-------------------End--------------------------//


//-----------------------Mission--------------------//
router.get('/create-mission',  ensureAuthenticated, async(req, res) => {
  await res.render('create_mission', { user : req.user} )
})

//------------------------End----------------------//


// Emails---------------------------------------------------------------Email//

const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif',  'heic'] // Optional: specify allowed file formats
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the file
    cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname));
  }
});

const uploaded = multer({ storage: storage });

router.post('/send-email', uploaded.single('attachment'), async (req, res) => {
  const { subject, message } = req.body;
  try {
    const html = `
    <html>
    <head>
      <style>
      * {
      box-sizing: border-box;
  }
      
        body {
          font-family: Arial, sans-serif;
          font-size: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 10px;
          flex-direction: column;
          margin: 5px;
          padding:5px;
        }
        header {
          width:100%;
          height: 180px;
          background: #b25400;
          border-radius: 10px;
          padding: 4px;
        }

        header div {
          display: flex;
          justify-content: center;
          align-items: center;
          width:100%;
          height: 170px;
          background-color: #f8f9fa !important;
          border-radius: 10px;
          flex-direction: column !important;
          padding: 10px;
          gap: 10px;
          text-align: center;
        }

        header div h1 {
          color: #b25400;
        }

        div span {
          color: #000000 !important;
        
        }

        header .span {
          color: #495057 !important;
        }

        h2 {
          color: #b25400;
          text-align: center;
        }
        p {
          line-height: 1.5;
          white-space: pre-line;
          text-align: center;
        }
      </style>
    </head>
    <body>
    <header>
      <div>
      <h1>
      Valiant<span class='love'>foot</span> <span class='span'> Limited</span>
      </h1><br>
      <h5>
      Threshold Business Suite,
      Plot 976, Block 2f4.
      Olusegun Obasanjo Way,
      FCT, Abuja.
      </h5><br>
      <h6>
      <a href='https://valiantfoothomes.org'>Visit Our Website</a>
      </h6>
      </div>
    </header>
      <h2>${req.body.subject}</h2>
      <p>${req.body.message}</p>
    </body>
  </html>
  `;

    const subscribers = await Subscriber.find({});
    const recipientEmails = subscribers.map(subscriber => subscriber.email);

    const mailOptions = {
      from: 'Valiantfoot@gmail.com',
      to: recipientEmails,
      subject: req.body.subject,
      html: html,
      attachments: [{
        filename: req.file.originalname,
        path: req.file.path,
      }],
    };

    const smtpConfig = {
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: 'Valiantfoot@gmail.com',
        pass: PASSWORD_EMAIL
      },
      pool: true, // Enable the use of a pooled connection
      maxConnections: 5, // Limit the number of simultaneous connections
      maxMessages: 100, // Limit the number of messages per connection
      rateDelta: 1000, // Increase the delay between messages if rate limit is exceeded
      rateLimit: 1000, // Maximum number of messages that can be sent per minute
    };

    const transporters = nodemailer.createTransport(smtpPool(smtpConfig));
    await transporters.sendMail(mailOptions);
    req.flash('success_msg', 'Email sent');
  } catch (err) {
    console.log(err);
    req.flash('error', 'Could not send email');
  }
  res.redirect('/admin/email_subscriber');
});


//single reply

const uploading = multer({ storage: storage });

router.post('/send-single-email', uploading.single('attachment'), async (req, res) => {
  const { subject, message, email } = req.body;
  const id = req.query.id;
  try {
   
    const html =`
    <html>
    <head>
      <style>
      * {
      box-sizing: border-box;
  }
      
        body {
          font-family: Arial, sans-serif;
          font-size: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 10px;
          flex-direction: column;
          margin: 5px;
          padding:5px;
        }
        header {
          width:100%;
          height: 180px;
          background: #b25400;
          border-radius: 10px;
          padding: 4px;
        }

        header div {
          display: flex;
          justify-content: center;
          align-items: center;
          width:100%;
          height: 170px;
          background-color: #f8f9fa !important;
          border-radius: 10px;
          flex-direction: column !important;
          padding: 10px;
          gap: 10px;
          text-align: center;
        }

        header div h1 {
          color: #b25400;
        }

        div span {
          color: #000000 !important;
        
        }

        header .span {
          color: #495057 !important;
        }

        h2 {
          color: #b25400;
          text-align: center;
        }
        p {
          line-height: 1.5;
          white-space: pre-line;
          text-align: center;
        }
      </style>
    </head>
    <body>
    <header>
      <div>
      <h1>
      Valiant<span class='love'>foot</span> <span class='span'> Limited</span>
      </h1><br>
      <h5>
      Threshold Business Suite,
      Plot 976, Block 2f4.
      Olusegun Obasanjo Way,
      FCT, Abuja.
      </h5><br>
      <h6>
      <a href='https://valiantfoothomes.org'>Visit Our Website</a>
      </h6>
      </div>
    </header>
      <h2>${req.body.subject}</h2>
      <p>${req.body.message}</p>
    </body>
  </html>
  `;
    
    const mailOptions = {
      from: 'Valiantfoot@gmail.com',
      to: req.body.email,
      subject: req.body.subject,
      html: html,
      attachments: [{
        filename: req.file.originalname,
        path: req.file.path,
      }],
    };

    
    const smtpConfig = {
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: 'Valiantfoot@gmail.com',
        pass: PASSWORD_EMAIL
      },
      pool: true, // Enable the use of a pooled connection
      maxConnections: 5, // Limit the number of simultaneous connections
      maxMessages: 100, // Limit the number of messages per connection
      rateDelta: 1000, // Increase the delay between messages if rate limit is exceeded
      rateLimit: 1000, // Maximum number of messages that can be sent per minute
    };
    const transporter = nodemailer.createTransport(smtpPool(smtpConfig));
    await transporter.sendMail(mailOptions);
    req.flash('success_msg', 'Email sent');
  } catch (err) {
    console.log(err);
    req.flash('error', 'Could not send email');
  }
  res.redirect('/admin/replying?id=' + id);
});

module.exports = router;



// router.post('/send-email', async (req, res) => {
//   const { subject, message } = req.body;

//   // Define the HTML content of your email
//   const html = `
//     <html>
//       <head>
//         <style>
//           /* Define your CSS styles here */
//           body {
//             font-family: Arial, sans-serif;
//             font-size: 16px;
//             color: #333;
//           }
//           h1 {
//             color: #ff0000;
//           }
//           p {
//             line-height: 1.5;
//           }
//         </style>
//       </head>
//       <body>
//       <img src="/img/Valiant-01.png" width="100">
//         <h1>${req.body.subject}</h1>
//         <p>${req.body.message}</p>
//       </body>
//     </html>
//   `;

//   try {
//     const subscribers = await Subscriber.find({});
//     const recipientEmails = subscribers.map(subscriber => subscriber.email);

//     const mailOptions = {
//       from: 'Valiantfoot@gmail.com',
//       to: recipientEmails,
//       subject: req.body.subject,
//       html: html, // Set the HTML content of your email
//     };

//     await transporter.sendMail(mailOptions);
//     req.flash('success_msg', 'Email sent');
//   } catch (err) {
//     console.log(err);
//     req.flash('error', 'Could not send email');
//   }

//   res.redirect('/admin/email_subscriber');
// });

// router.post('/contact', async (req, res) => {
//   const { name, email, subject, message } = req.body;
//   const newContact = { name, email, subject, message };
//   try {
//     const contact = await Contact.create(newContact);
//     if (!contact) {
//       throw new Error();
//       req.flash('error', 'Could not save contact');
//     } else {
//       console.log(contact);
//       req.flash('success', 'Contact saved');
//       // add new subscriber
//       const newSubscriber = { email };
//       const subscriber = await Subscribers.findOne({ email });
//       if (!subscriber) {
//         const newSubscriber = await Subscribers.create(newSubscriber);
//         if (!newSubscriber) {
//           console.log('error finding contact');
//           req.flash('error', 'error finding contact');
//         } else {
//           console.log(newSubscriber);
//         }
//       }
//       // send email to subscribers
//       const subject = 'New Contact';
//       const html = '<p>A new contact has been added to the website.</p>';
//       await sendEmailToSubscribers(subject, html);
//     }
//     res.redirect('/contact');
//   } catch (err) {
//     console.error(err);
//     req.flash('error', 'Could not save contact');
//     res.redirect('/contact/1');
//   }
// });

// router.post('/send-email', async (req, res) => {
//   const { subject, message } = req.body;
//   try {
//     const html = `
//     <html>
//       <head>
//         <style>
//           /* Define your CSS styles here */
//           body {
//             font-family: Arial, sans-serif;
//             font-size: 16px;
//             color: #333;
//           }
//           h1 {
//             color: #ff0000;
//           }
//           p {
//             line-height: 1.5;
//           }
//         </style>
//       </head>
//       <body>
//       <img src="/assets/img/Valiant-01.png" alt="Company Logo">
//         <h1>${req.body.subject}</h1>
//         <p>${req.body.message}</p>
//       </body>
//     </html>
//   `;
//     const subscribers = await Subscriber.find({});
//     const recipientEmails = subscribers.map(subscriber => subscriber.email);
//     const mailOptions = {
//       from: 'Valiantfoot@gmail.com',
//       to: recipientEmails,
//       subject: req.body.subject,
//       html: html,
//     };
//     await transporter.sendMail(mailOptions);
//     req.flash('success_msg', 'Email sent');
//   } catch (err) {
//     console.log(err);
//     req.flash('error', 'Could not send email');
//   }
//   res.redirect('/admin/email_subscriber');
// });