const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Set up storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// POST route to handle form submission
app.post('/submit', upload.single('logo'), (req, res) => {
  const {
    name, email, unit, gearType, color, printLocation,
    quantity, printType, deadline, zipcode, notes
  } = req.body;

  const file = req.file;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'theprintstop619@gmail.com',
      pass: 'obsfjhdpuxtuuoha' // App password — make sure there are NO SPACES
    }
  });

  const mailOptions = {
    from: 'theprintstop619@gmail.com',
    to: 'theprintstop619@gmail.com',
    subject: 'New Order Quote Request',
    text: `
Name: ${name}
Email: ${email}
Unit: ${unit}
Gear Type: ${gearType}
Color: ${color}
Print Location: ${printLocation}
Quantity: ${quantity}
Print Type: ${printType}
Deadline: ${deadline}
Zip Code: ${zipcode}
Notes: ${notes}
    `,
    attachments: file ? [{ path: file.path }] : []
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Failed to send internal email:', error);
      return res.send('Error sending email.');
    } else {
      console.log('Internal email sent:', info.response);

      // Send confirmation email to customer
      if (email) {
        const customerMailOptions = {
          from: 'theprintstop619@gmail.com',
          to: email,
          subject: 'Thank you for your quote request',
          text: `
Hi ${name},

Thank you for reaching out to The Print Stop! We’ve received your request and will review your information shortly.

If we have any questions or need clarification, we’ll be in touch. Otherwise, expect a quote from us soon.

We appreciate the opportunity to serve you.

Best regards,  
The Print Stop Team
          `
        };

        transporter.sendMail(customerMailOptions, (err, info) => {
          if (err) {
            console.error('Failed to send confirmation email:', err);
          } else {
            console.log('Confirmation email sent:', info.response);
          }
        });
      }

      if (file) fs.unlinkSync(file.path);
      res.send('Quote submitted successfully!');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
