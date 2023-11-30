if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const router = express.Router();
const Property = require("../models/properties");
const Land = require("../models/land");
const Blog = require("../models/blog")
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
const CareerCreation = require('../models/newJob')

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
          req.flash('success_msg', 'You are welcome'+ ' ' + req.user.first_name);
          
        })
       
      }
      else {
        req.logOut(function (err) {
          if (err) {
              return next(err);
          }
         
          res.redirect('/admin/login')
          req.flash('error_msg', 'Login details not correct');
      })
      }
   
    req.flash('success_msg', 'You are welcome');
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
    const about = await About.find().select("_id name address state mobile mobile2 mobile3 whatsapp email").sort({ createdAt: -1 }).limit(1).exec();
    const service = await Service.find().select("message heading").sort({createdAt : -1}).limit(3)
    const subscriber = await Subscriber.find().select("email").exec();

  await res.render("dashboard", {
      user: req.user,
      land,
      house,
      staff,
      contact,
      houses,
      lands,
      about: about[0],
      service,
      subscriber,
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


//housing
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
        amenities: req.body.amenities.split(",").map(function (amenity) {
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
        amenities: req.body.amenities.split(",").map(function (amenity) {
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
        jobDescription: jobDescription.split('.').map(jobDescription => jobDescription.trim()),
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
    await CareerCreation.updateOne({ _id: id}, {$set: {jobName: jobName, jobDescription: jobDescription.split('.').map(jobDescription => jobDescription.trim()), }})
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