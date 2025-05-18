const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware
app.use(express.static('public')); // Serves index.html and assets from /public
app.use(express.urlencoded({ extended: true }));

// Handle form POST submission
app.post('/submit', upload.single('logo'), (req, res) => {
  const {
    name, email, unit, gearType, color, printLocation,
    sizeXS, sizeS, sizeM, sizeL, sizeXL, size2XL, size3XL,
    quantity, printType, deadline, zipcode, notes
  } = req.body;

  const file = req.file;

  // Email transport setup
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'theprintstop619@gmail.com',
      pass: 'gbbzzvjiwrtepmfg' // App password, not your normal Gmail login
    }
  });

  // Email to business
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
Print Type: ${printType}
Deadline: ${deadline}
Zip Code: ${zipcode}
Total Quantity: ${quantity}

Size Breakdown:
XS: ${sizeXS}
S: ${sizeS}
M: ${sizeM}
L: ${sizeL}
XL: ${sizeXL}
2XL: ${size2XL}
3XL: ${size3XL}

Notes: ${notes}
    `,
    attachments: file ? [{ path: file.path }] : []
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending to business:', error);
      return res.status(500).send('Error sending email.');
    }

    // Send confirmation to customer
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
              You can expect a follow-up from us soon with pricing or any clarification needed.
            </p>
            <p style="font-size: 16px; color: #555;"><strong>Semper Fidelis.</strong></p>
            <p style="font-size: 16px; color: #555;">Best regards,<br>The Print Stop Team</p>
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

    // Clean up uploaded file if needed
    if (file) fs.unlinkSync(file.path);

    // Final user response
    res.send('Quote submitted successfully!');
  });
});

// Correct binding for Render — no 'localhost'
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
