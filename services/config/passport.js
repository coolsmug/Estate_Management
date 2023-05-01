const passport = require('passport');
const bcrypt = require("bcrypt");
const AdminStrategy = require('passport-local').Strategy;
const StaffStrategy = require('passport-local').Strategy;


const Admin = require("../models/admin");
const Staff = require('../models/staff');

module.exports = function (passport) {
    passport.use("admin_login", new AdminStrategy ( {  
        usernameField: "email",
        passwordField: "password"
      }, async (email, password, done)  => {
        try {
            const user = await Admin.findOne( { email } );
            if (!user) {
                return done(null, false, { message :'Incorrect email or password.'} );
            }

            const isValid = await bcrypt.compare(password, user.password);

            if (!isValid) {
                return done(null, false, { message: "Incorrect email or password."} );
            }

            return done(null, user)
        } catch (error) {
            return done(error);
        }
      }));

      passport.use("staff_login", new StaffStrategy ( {
        usernameField: "email",
        passwordField: "password",
      }, async (email, password, donr) => {
        try {
            const staff = await Staff.findOne( { email } )

            if(!staff) {
                return done(null, false,  { message : "Incorrect email or password."});
            }

            const isValid = await bcrypt.compare(password, staff.password)

            if(!isValid) {
                return done(null, false, { message: " Incorrect email or Password"});
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
      } 
      
      ))

      passport.serializeUser((user, done) => {
        done(null, user.id);
      });

      passport.deserializeUser( async (id, done) => {
        try {

            const admin = await Admin.findById(id);
            const staff = await Staff.findById(id);
            if (admin) {
                done(null, admin);
            }else if (staff) {
                done(null, staff)
            }else {
                done(new Error('User not found.'))
            }

        } catch (error) {
            done(error)
        }
      });
}  