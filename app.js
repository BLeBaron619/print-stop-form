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
      pass: 'ddemkjnpgveznuzd' // App password — no spaces
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

      // Send HTML confirmation email to customer
      if (email) {
        const customerMailOptions = {
          from: '"The Print Stop" <theprintstop619@gmail.com>',
          to: email,
          subject: 'Thank you for your quote request',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
              <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333;">Thank you, ${name}!</h2>
                <p style="font-size: 16px; color: #555;">
                  We’ve received your quote request and our team is reviewing the details.
                </p>
                <p style="font-size: 16px; color: #555;">
                  You can expect a follow-up from us soon with pricing or questions if we need anything clarified.
                </p>
                <p style="font-size: 16px; color: #555;">
                  We appreciate the opportunity to serve your unit, team, or organization!
                </p>
                <hr style="margin: 30px 0;">
                <p style="font-size: 14px; color: #888;">
                  The Print Stop<br>
                  theprintstop619@gmail.com
                </p>
              </div>
            </div>
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
