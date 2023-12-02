const express = require("express");
const router = express.Router();
const Blog = require('../models/blog');
const Admin = require("../models/admin");
const Staff = require("../models/staff");
const Land = require("../models/land");
const Property = require("../models/properties");
const About = require('../models/about');
const Service = require('../models/services');
const Contact = require('../models/contact');
const Subscribers = require('../models/subscriber');
const Testimony = require('../models/testimoniy');
const ImageContact = require('../models/contact.image');
const CareerCreation = require('../models/newJob');
const Vision = require('../models/vision');
const Mission = require('../models/mission');



// rendering and serving of data
router.get("/about", async(req, res) => {
    try {
        const aboutsss = await About.find().select("about company_name heading img img2" ).sort({createdAt: -1}).limit(1).exec();
        const staff = await Staff.find({ managingStatus : true });
        // const staff = await Staff.find({ position: { $in: ["Managing Director", "General Manager"]}}).sort({ name: -1 }).limit(3);

await res.render("about", {
        aboutsss: aboutsss[0],
        staff
    })
    } catch (error) {
        console.log(error)
    }
})

router.get("/single-service", async(req, res) => {
    const id = req.query.id;
    try {
        if (req.query){

            const service = await Service.findById(id)
            const  about= await Staff.find().sort({ createdAt: -1 }).limit(1);
    
    await res.render("service_single", {

            service: service,
            about: about[0],
           
        })
        }
       
    } catch (error) {
        console.log(error)
    }
})



router.get('/', async (req, res) => {
    try {
        const blog = await Blog.find().sort({ createdAt: -1 }).limit(4);
        
        const property = await Property.find({ status: { $in: ["Rent", "Sale"] } })
            .select("name property_id area period status location _id img price img2")
            .sort({ createdAt: -1 })
            .limit(3);
        
        const propertyAll = await Property.find()
            .select("name area period location bed garage baths area img img2")
            .sort({ createdAt: -1 })
            .limit(4);
        
        const service = await Service.find()
            .select("heading about")
            .sort({ createdAt: -1 })
            .limit(4);
        
        const land = await Land.find()
            .select("name area period location img image property_id _id period price")
            .sort({ createdAt: -1 })
            .limit(4);
        
        const testimony = await Testimony.find().sort({ createdAt: -1 }).exec();

        const vision = await Vision.find().sort({ createdAt: -1 }).limit(1);

        const mission = await Mission.find().sort({ createdAt: -1 }).limit(1);

        


       await res.render('index', {
            blog,
            property,
            propertyAll, // Use a more descriptive variable name for clarity
            land,
            service,
            testimony,
            mission: mission[0],
            vision: vision[0], // Use a more descriptive variable name for clarity
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err + ':' +'Internal server error');
    }
});

module.exports = router;


// Agent
router.get("/agent_single", async(req, res) => {
    await res.render("agent-single")
})

router.get("/agents", async(req, res, next) => {
    try {
      

        await Staff.find({ managingStatus: false } )
                   
                    .then((staff) => {
                        Staff.countDocuments()
                                .then((count) => {
                                   res.render('agents-grid', {
                                        staff: staff,                           
                                    })
                                }).catch((err) => {
                                    console.log(err)
                                    next(err)
                                })
                    }).catch((err) => {
                        console.log(err)
                        next(err)
                    })                       
} catch (error) {
    console.log(error)
    next(error)

}
})

//blog
router.get("/blogs/:page", async(req, res, next) => {
   try {
        const perPage = 9;
        const page = req.params.page || 1

        await Blog.find()
                    .sort({createdAt : -1})
                    .skip((perPage * page) - perPage)
                    .limit(perPage)
                    .then((blog) => {
                        Blog
                        .countDocuments()
                        .then((count) => {
                         res.render("blog-grid", {
                                blog: blog,
                                current: page,
                                pages: Math.ceil(count / perPage), 

                            })
                        }).catch((err) => {
                            console.log(err);
                            next(err);
                        })
                    }).catch((err) => {
                        console.log(err);
                        next(err);
                    })
    
   } catch (error) {
    console.log(error);
    next(error);
   }
})

//blog single
router.get("/blog_single", async(req, res, next) => {
    try {
        if(req.query) {
            const id = req.query.id
            await Blog.findById(id)
                            .then((blog) => {
                         res.render("blog-single", {
                                blog: blog,
                            })
                            }).catch((err) => {
                                console.log(err)
                                next(err)
                            })
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})


router.get("/blog_single", async(req, res) => {
    await res.render("blog-single")
})

// contact_image
router.get("/contact", async (req, res) => {
  try {
      const contact = await ImageContact.find().sort({ createdAt: -1 }).limit(1).exec();

      if (contact && contact.length > 0) {
         await res.render("contact", {
              contact: contact[0], // Access the first element of the contact array
          });
      } else {
          // If no contact found, pass an empty object to the view
         await res.render("contact", {
              contact: {}, // You might want to pass an empty object or handle it differently
          });
      }
  } catch (error) {
      res.status(500).json({ error: "Technical error" });
  }
});




// Route for filtering properties with pagination
router.get('/property/:page', async (req, res, next) => {
    const filterOption = req.query.filterOption;
    let filter = {};
    
    // Set filter based on selected option
    if (filterOption === 'All') {
      filter = {};
    } else if (filterOption === '1') {
      filter = {}; // No filter applied, sort by createdAt field
    } else if (filterOption === '2') {
      filter = { status: "Rent" }; // For Rent
    } else if (filterOption === '3') {
      filter = { status: "Sale" }; // For Sale
    } else if (filterOption === "4") {
      filter = { status: "Sold" }; // For Sold
    }
    
    try {
      // Set pagination variables
      const perPage = 9;
      const page = req.params.page || 1;
    
      let query = Property.find(filter);
    
      if (filterOption === '1') {
        query = query.sort({ createdAt: -1 }); // Sort by createdAt field, newest to oldest
      }
    
      // Retrieve paginated properties and count total number of properties matching filter
      const result = await query.skip((perPage * page) - perPage).limit(perPage).exec();
      const count = await Property.countDocuments(filter).exec();
  
     await res.render("property-grid", {
        result: result,
        current: page,
        pages: Math.ceil(count / perPage),
        filterOption: filterOption // Pass filter option to template
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

//single housing assign with agent
router.get("/property_single", async(req, res, next) => {
    try {
        if(req.query) {
            const id = req.query.id

            const prop =  await Property.findById(id).exec()
            const staff = await Staff.find({ propid: prop.name.trim() })
                              
          await  res.render("property-single", {
              prop: prop,
              staff: staff[0],
          })
                                
                           
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

  
// lands 
// Route for filtering properties with pagination
router.get('/lands/:page', async (req, res, next) => {
    const filterOption = req.query.filterOption;
    let filter = {};
    
    // Set filter based on selected option
    if (filterOption === 'All') {
      filter = {};
    } else if (filterOption === '1') {
      filter = {}; // No filter applied, sort by createdAt field
    } else if (filterOption === '2') {
      filter = { status: "Rent" }; // For Rent
    } else if (filterOption === '3') {
      filter = { status: "Sale" }; // For Sale
    } else if (filterOption === "4") {
      filter = { status: "Sold" }; // For Sold
    }
    
    try {
      // Set pagination variables
      const perPage = 9;
      const page = req.params.page || 1;
    
      let query = Land.find(filter);
    
      if (filterOption === '1') {
        query = query.sort({ createdAt: -1 }); // Sort by createdAt field, newest to oldest
      }
    
      // Retrieve paginated properties and count total number of properties matching filter
      const result = await query.skip((perPage * page) - perPage).limit(perPage).exec();
      const count = await Land.countDocuments(filter).exec();
  
     await res.render("land_property", {
        result: result,
        current: page,
        pages: Math.ceil(count / perPage),
        filterOption: filterOption // Pass filter option to template
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //single land

  router.get("/land_single", async(req, res, next) => {
    try {
        if (req.query) {
            const id = req.query.id;
            await Land.findById(id)
                .then((prop) => {
                    console.log(prop.name);
                    Staff.find({ landid: prop.name })
                        .then((staff) => {
                            res.render("land_single", {
                                prop: prop,
                                staff: staff[0],
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                            next(err);
                        });
                })
                .catch((err) => {
                    console.log(err);
                    next(err);
                });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});



// Define search route
router.post('/search', async (req, res) => {
    const collection = req.body.collection;
    const query = req.body.query;
    let prop;
  
    try {
      if (collection === 'land') {
        prop = await Land.find({ $text: { $search: query } });
        res.render('landing', { prop });
      } else if (collection === 'property') {
        const totalDocs = await Property.countDocuments();
        const matchingDocs = await Property.countDocuments({ $text: { $search: query } });
        const matchPercentage = (matchingDocs / totalDocs) * 100;
        if (matchPercentage >= 20) {
          prop = await Property.find({ $text: { $search: query } });
         await res.render('homings', { prop });
        } else {
          res.send('Search query did not match enough documents in the collection.');
        }
      } else {
        res.send('Invalid collection');
      }
    } catch (error) {
      console.log(error);
      res.send('Error searching for result');
    }
  });
  
  
  //Contact and subscriber
  router.post('/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      req.flash('error', 'Please fill all fields');
    res.redirect('/contact');
      return;
    }
  
    const newContact = { name, email, subject, message };
    Contact.create(newContact)
      .then((contact) => {
         
          req.flash("success_msg", "Message sent");
          // add new subscriber
          const newSubscriber = { email };
          Subscribers.findOne({ email })
                      .then((subscriber) => {
           if (!subscriber) {
              console.log('Subscriber not found, creating new subscriber');
              Subscribers.create(newSubscriber)
                .then((subscriber) => {
                   
                    req.flash("success_msg", "Message sent");
                  
                })
                .catch((err) => console.log(err));
            } else {
              console.log('Subscriber found, not creating new subscriber');
            }
          }).catch((err) => {
            console.log(err)
          });
        res.redirect('/contact');
      })
      .catch(err => {
        console.log(err);
        req.flash('error_msg', 'Could not save contact');
        res.redirect('/contact');
      });
  });
  
//testimony
router.get('/feedback', async (req, res) => {
  try {
  
    res.render('create_feedback')
  } catch (error) {
    console.log(error);
  }
})


//----------------------CAREARS-----------------------------------//

router.get('/career', async(req, res) => {
  try {

    const career =  await CareerCreation.find({ status : true }).exec();

   await res.render('carearFrontPage', {
      career,
    });
  } catch (error) {
    console.log(error);
  }
})




//------------------------------End -----------------------------------//




// redirecting routes

router.get('/homing', async (req, res) => {
    await res.redirect('/')
});

router.get('/abouting', async (req, res) => {
    await res.redirect('/about')
});

router.get('/properting', async (req, res) => {
    await res.redirect('/property/1')
});

router.get('/bloging', async (req, res) => {
    await res.redirect('/blogs/1')
});

router.get("/contact", async(req, res) => {
  await res.redirect('/contact')
})

router.get('/landing', async (req, res) => {
    await res.redirect('/lands/1')
});



module.exports = router;