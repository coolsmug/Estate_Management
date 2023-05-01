
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'Valiantfoot@gmail.com',
    pass: 'fcimwzmombmhkjyg'
  }
});

module.exports = transporter;