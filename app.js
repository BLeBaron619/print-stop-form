const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Set up storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Serve static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// POST route
app.post('/submit', upload.single('logo'), (req, res) => {
  const {
    name, email, unit, gearType, quantity,
    printType, deadline, zipcode, notes
  } = req.body;

  const file = req.file;

  // Email config
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'theprintstop619@gmail.com',
      pass: 'with wxgo zjsx qnle'
    }
  });

  const mailOptions = {
    from: 'your_email@gmail.com',
    to: 'theprintstop619@gmail.com',
    subject: 'New Order Quote Request',
    text: `
Name: ${name}
Email: ${email}
Unit: ${unit}
Gear Type: ${gearType}
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
      return res.send('Error sending email.');
    } else {
      // Optionally delete file after sending
      if (file) fs.unlinkSync(file.path);
      res.send('Quote submitted successfully!');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
