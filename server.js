

// Import required modules
import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import cors from "cors";
import bodyParser from "body-parser";
import PDFDocument from "pdfkit";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url"; // Required for `__dirname`
import { spawn } from "child_process"; 
import axios from "axios";




dotenv.config();
// Define your file path


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




const app = express(); // ✅ Define app before using it
const PORT = 5000;

// Enable CORS
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());

// Configure Multer for File Uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage  });

// Nodemailer Configuration for Zoho
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465, // SSL port
  secure: true,
  auth: {
    user: "neatgarmsltd@zohomail.com", // Your Zoho email
    pass: "N0wdHVPctWEa", // Your Zoho app password
  },
  tls: {
    rejectUnauthorized: false, // Ignore self-signed certificate errors
  },
});

app.post(
  "/submit-form",
  upload.fields([
    { name: "frontView", maxCount: 1 },
    { name: "backView", maxCount: 1 },
    { name: "rightSideView", maxCount: 1 },
    { name: "leftSideView", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, email, phone } = req.body;

      // Generate PDF file
      const pdfFilePath = path.join(__dirname, "uploaded_images.pdf");
      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream(pdfFilePath);
      doc.pipe(writeStream);

      doc.fontSize(16).text(`Form Submission Details`, { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Name: ${name}`);
      doc.text(`Email: ${email}`);
      doc.text(`Phone: ${phone}`);
      doc.moveDown();

      // Add uploaded images to PDF
      ["frontView", "backView", "rightSideView", "leftSideView"].forEach((field) => {
        if (req.files[field]) {
          doc.addPage().image(req.files[field][0].buffer, { fit: [500, 500] });
        }
      });

      doc.end();
      await new Promise((resolve) => writeStream.on("finish", resolve));

      // Email Configuration to Your Inbox
      const mailOptions = {
        from: "neatgarmsltd@zohomail.com",
        to: "neatgarmsltd@zohomail.com",
        subject: "New Form Submission with PDF",
        text: `You have received a new form submission.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nImages are attached as a PDF.`,
        attachments: [{ filename: "uploaded_images.pdf", path: pdfFilePath }],
      };

      // Send Email to Yourself
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent to your inbox:", info.response);

      // Autoresponder Email to the Sender
      const autoResponseOptions = {
        from: "neatgarmsltd@zohomail.com",
        to: email,
        subject: "Thank You for Your Submission!",
        text: `Thank you for choosing Neatgarms, ${name}!\n\nWe will get back to you soon.\n\nHappy shopping 🛍️`,
      };

      // Send Autoresponse
      const autoInfo = await transporter.sendMail(autoResponseOptions);
      console.log("Autoresponse sent to user:", autoInfo.response);

      // Delete PDF after sending email
      fs.unlinkSync(pdfFilePath);

      // Send Success Response
      res.json({ success: true, message: "Form submitted successfully!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, message: "Error sending email" });
    }
  }
);

app.post("/pay-now", async (req, res) => {
  try {
    const { itemCount, designs, sizes, colors, contact, delivery, billing, paymentMethod, orderSummary } = req.body;
  
    // Format the details for the admin email
    let emailContent = `New Pay Now Submission:\n\n`;
    emailContent += `Number of Items (for custom options): ${itemCount}\n\n`;
  
    // Order Details for each item (if any custom options were provided)
    for (let i = 0; i < itemCount; i++) {
      emailContent += `Item ${i + 1}:\n`;
      emailContent += `Design: ${designs[i] || "N/A"}\n`;
      emailContent += `Size: ${sizes[i] || "N/A"}\n`;
      emailContent += `Color: ${colors[i] || "N/A"}\n\n`;
    }
  
    // --- New: Order Summary Section from Cart ---
    if (orderSummary) {
      emailContent += `Order Summary (Cart Details):\n`;
  
      // Loop through each cart item and list its details
      if (orderSummary.cartItems && orderSummary.cartItems.length > 0) {
        orderSummary.cartItems.forEach((item, index) => {
          // Clean the price if necessary
          const cleanedPrice = (item.newPrice || '0').replace(/KSh|,/g, '').trim();
          const price = parseFloat(cleanedPrice) || 0;
          const quantity = parseInt(item.quantity) || 1;
          const totalPrice = price * quantity;
  
          emailContent += `Item ${index + 1}:\n`;
          emailContent += `- Name: ${item.name}\n`;
          emailContent += `- Brand: ${item.brand}\n`;
          emailContent += `- Price: KSh${price.toFixed(2)}\n`;
          emailContent += `- Quantity: ${quantity}\n`;
          if (item.size) {
            emailContent += `- Size: ${item.size}\n`;
          }
          if (item.color) {
            emailContent += `- Color: ${item.color}\n`;
          }
          emailContent += `- Total Price: KSh${totalPrice.toFixed(2)}\n\n`;
        });
      } else {
        emailContent += `No items found in cart.\n\n`;
      }
  
      // Include the overall estimated total (from the page)
      emailContent += `Estimated Total (as displayed): KSh${orderSummary.estimatedTotal}\n\n`;
    }
  
    // Contact Information
    emailContent += `Contact Information:\n`;
    emailContent += `Email: ${contact.email}\n`;
    emailContent += `Phone Number: ${contact.phone}\n`;
    emailContent += `Wants News & Offers: ${contact.newsOffers}\n\n`;
  
    // Delivery Information
    emailContent += `Delivery Information:\n`;
    emailContent += `Country/Region: ${delivery.country}\n`;
    emailContent += `First Name: ${delivery.firstName}\n`;
    emailContent += `Last Name: ${delivery.lastName}\n`;
    emailContent += `Address: ${delivery.address}\n`;
    emailContent += `Apartment/Suite: ${delivery.apartment}\n`;
    emailContent += `City: ${delivery.city}\n`;
    emailContent += `Postal Code: ${delivery.postalCode}\n`;
    emailContent += `Phone: ${delivery.phone}\n`;
    emailContent += `Shipping Method: ${delivery.shippingMethod}\n\n`;
  
    // Billing Information
    emailContent += `Billing Information:\n`;
    if (billing.note) {
      emailContent += `${billing.note}\n`; // e.g., "Same as shipping address"
    } else {
      emailContent += `Country/Region: ${billing.country}\n`;
      emailContent += `First Name: ${billing.firstName}\n`;
      emailContent += `Last Name: ${billing.lastName}\n`;
      emailContent += `Address: ${billing.address}\n`;
      emailContent += `Apartment/Suite: ${billing.apartment}\n`;
      emailContent += `Postal Code: ${billing.postalCode}\n`;
      emailContent += `Phone: ${billing.phone}\n`;
    }
    emailContent += `\n`;
  
    // Payment Method
    emailContent += `Payment Method:\n`;
    emailContent += `${paymentMethod}\n`;
  
    // Email to Admin
    const adminMailOptions = {
      from: "neatgarmsltd@zohomail.com",
      to: "neatgarmsltd@zohomail.com",
      subject: "New Pay Now Submission with Order Summary, Contact, Delivery, Billing & Payment Info",
      text: emailContent,
    };
  
    // Send Email to Admin
    const info = await transporter.sendMail(adminMailOptions);
    console.log("Pay Now Email sent to admin:", info.response);
  
    // --- Autoresponse Email to User ---
    let userOrderDetails = '';
    for (let i = 0; i < itemCount; i++) {
      userOrderDetails += `Item ${i + 1}:\n`;
      userOrderDetails += `- Design: ${designs[i] || "N/A"}\n`;
      userOrderDetails += `- Size: ${sizes[i] || "N/A"}\n`;
      userOrderDetails += `- Color: ${colors[i] || "N/A"}\n\n`;
    }
  
    const userMailOptions = {
      from: "neatgarmsltd@zohomail.com",
      to: contact.email,
      subject: "Thank You for Your Order with Neatgarms! 🎉",
      text: `Hi ${delivery.firstName},

Thank you for shopping with **Neatgarms**! 🎉

We’ve successfully received your order. Our team is now processing it and will notify you once it ships.

🛍 **Order Details:**
${userOrderDetails}

💳 **Payment Method:** ${paymentMethod}

🚚 **Delivery Address:**
${delivery.firstName} ${delivery.lastName}
${delivery.address}, ${delivery.city}, ${delivery.country}
${delivery.postalCode}
Phone: ${delivery.phone}

If you have any questions or need assistance, feel free to contact us at **support@neatgarms.com**.

Thank you for choosing Neatgarms! We can't wait for you to rock your new look! 😎✨

Warm regards,  
**The Neatgarms Team**  
www.neatgarms.com`,
    };
  
    // Send Autoresponse Email
    await transporter.sendMail(userMailOptions);
    console.log("Autoresponse email sent to user.");
  
    // Respond to client
    res.json({ success: true, message: "Pay Now form submitted successfully!" });
  } catch (error) {
    console.error("Error sending Pay Now email:", error);
    res.status(500).json({ success: false, message: "Error sending Pay Now email" });
  }
});



app.post("/pay2-now", async (req, res) => {
  try {
    const {
      itemCount,
      designs,
      sizes,
      colors,
      contact,
      delivery,
      billing,
      paymentMethod,
      orderSummary  // New field from the client
    } = req.body;

    // Format the details for the admin email
    let emailContent = `New Pay Now Submission:\n\n`;
    emailContent += `Number of Items: ${itemCount}\n\n`;

    // --- Order Summary Section ---
    if (orderSummary) {
      emailContent += `Order Summary:\n`;
      emailContent += `Product Name: ${orderSummary.name}\n`;
      emailContent += `Brand: ${orderSummary.brand}\n`;
      emailContent += `Image URL: ${orderSummary.image}\n`;
      emailContent += `Old Price: ${orderSummary.oldPrice}\n`;
      emailContent += `New Price: ${orderSummary.newPrice}\n`;
      emailContent += `Quantity: ${orderSummary.quantity}\n`;
      emailContent += `Total: KSh${orderSummary.total}\n`;
      emailContent += `Estimated Total: KSh${orderSummary.estimatedTotal}\n\n`;
    }

    // --- Order Details for each item ---
    for (let i = 0; i < itemCount; i++) {
      emailContent += `Item ${i + 1}:\n`;
      emailContent += `Design: ${designs[i] || "N/A"}\n`;
      emailContent += `Size: ${sizes[i] || "N/A"}\n`;
      emailContent += `Color: ${colors[i] || "N/A"}\n\n`;
    }

    // --- Contact Information ---
    emailContent += `Contact Information:\n`;
    emailContent += `Email: ${contact.email}\n`;
    emailContent += `Phone Number: ${contact.phone}\n`;
    emailContent += `Wants News & Offers: ${contact.newsOffers}\n\n`;

    // --- Delivery Information ---
    emailContent += `Delivery Information:\n`;
    emailContent += `Country/Region: ${delivery.country}\n`;
    emailContent += `First Name: ${delivery.firstName}\n`;
    emailContent += `Last Name: ${delivery.lastName}\n`;
    emailContent += `Address: ${delivery.address}\n`;
    emailContent += `Apartment/Suite: ${delivery.apartment}\n`;
    emailContent += `City: ${delivery.city}\n`;
    emailContent += `Postal Code: ${delivery.postalCode}\n`;
    emailContent += `Phone: ${delivery.phone}\n`;
    emailContent += `Shipping Method: ${delivery.shippingMethod}\n\n`;

    // --- Billing Information ---
    emailContent += `Billing Information:\n`;
    if (billing.note) {
      emailContent += `${billing.note}\n`; // e.g., "Same as shipping address"
    } else {
      emailContent += `Country/Region: ${billing.country}\n`;
      emailContent += `First Name: ${billing.firstName}\n`;
      emailContent += `Last Name: ${billing.lastName}\n`;
      emailContent += `Address: ${billing.address}\n`;
      emailContent += `Apartment/Suite: ${billing.apartment}\n`;
      emailContent += `Postal Code: ${billing.postalCode}\n`;
      emailContent += `Phone: ${billing.phone}\n`;
    }
    emailContent += `\n`;

    // --- Payment Method ---
    emailContent += `Payment Method:\n`;
    emailContent += `${paymentMethod}\n`;

    // Email to Admin
    const adminMailOptions = {
      from: "neatgarmsltd@zohomail.com",
      to: "neatgarmsltd@zohomail.com",
      subject: "New Pay Now Submission with Order Summary, Contact, Delivery, Billing & Payment Info",
      text: emailContent,
    };

    // Send Email to Admin
    const info = await transporter.sendMail(adminMailOptions);
    console.log("Pay Now Email sent to admin:", info.response);

    // --- Autoresponse Email to User ---
    let userOrderDetails = '';
    for (let i = 0; i < itemCount; i++) {
      userOrderDetails += `Item ${i + 1}:\n`;
      userOrderDetails += `- Design: ${designs[i] || "N/A"}\n`;
      userOrderDetails += `- Size: ${sizes[i] || "N/A"}\n`;
      userOrderDetails += `- Color: ${colors[i] || "N/A"}\n\n`;
    }

    const userMailOptions = {
      from: "neatgarmsltd@zohomail.com",
      to: contact.email,
      subject: "Thank You for Your Order with Neatgarms! 🎉",
      text: `Hi ${delivery.firstName},

Thank you for shopping with **Neatgarms**! 🎉

We’ve successfully received your order of **${itemCount}** item(s). Our team is now processing it and will notify you once it ships.

🛍 **Order Details:**
${userOrderDetails}

💳 **Payment Method:** ${paymentMethod}

🚚 **Delivery Address:**
${delivery.firstName} ${delivery.lastName}
${delivery.address}, ${delivery.city}, ${delivery.country}
${delivery.postalCode}
Phone: ${delivery.phone}

If you have any questions or need assistance, feel free to contact us at **support@neatgarms.com**.

Thank you for choosing Neatgarms! We can't wait for you to rock your new look! 😎✨

Warm regards,  
**The Neatgarms Team**  
www.neatgarms.com`,
    };

    // Send Autoresponse Email
    await transporter.sendMail(userMailOptions);
    console.log("Autoresponse email sent to user.");

    // Respond to client
    res.json({ success: true, message: "Pay Now form submitted successfully!" });
  } catch (error) {
    console.error("Error sending Pay Now email:", error);
    res.status(500).json({ success: false, message: "Error sending Pay Now email" });
  }
});


app.post("/pay3-now", async (req, res) => {
  try {
    const {
      itemCount,
      design,
      sizes,
      colors,
      contact,
      delivery,
      billing,
      paymentMethod,
      orderSummary
    } = req.body;

    // --- Build the Admin Email (Plain Text) ---
    let emailContent = `New Pay Now Submission:\n\n`;
    emailContent += `Number of Items: ${itemCount}\n`;
    emailContent += `Selected Design: ${design}\n\n`;
    emailContent += `Payment Method: ${paymentMethod}\n\n`;

    // Order Details (custom options)
    for (let i = 0; i < itemCount; i++) {
      emailContent += `Item ${i + 1}:\n`;
      emailContent += `  Design: ${design}\n`;
      emailContent += `  Size: ${sizes[i] || "N/A"}\n`;
      emailContent += `  Color: ${colors[i] || "N/A"}\n\n`;
    }

    // Contact Information
    emailContent += `Contact Information:\n`;
    emailContent += `  Email: ${contact.email}\n`;
    emailContent += `  Phone Number: ${contact.phone}\n`;
    emailContent += `  Wants News & Offers: ${contact.newsOffers}\n\n`;

    // Delivery Information
    emailContent += `Delivery Information:\n`;
    emailContent += `  Country/Region: ${delivery.country}\n`;
    emailContent += `  First Name: ${delivery.firstName}\n`;
    emailContent += `  Last Name: ${delivery.lastName}\n`;
    emailContent += `  Address: ${delivery.address}\n`;
    emailContent += `  Apartment/Suite: ${delivery.apartment || "N/A"}\n`;
    emailContent += `  City: ${delivery.city}\n`;
    emailContent += `  Postal Code: ${delivery.postalCode}\n`;
    emailContent += `  Phone: ${delivery.phone}\n`;
    emailContent += `  Shipping Method: ${delivery.shippingMethod}\n\n`;

    // Billing Information
    emailContent += `Billing Information:\n`;
    if (billing.note) {
      emailContent += `${billing.note}\n`;
    } else {
      emailContent += `  Country/Region: ${billing.country}\n`;
      emailContent += `  First Name: ${billing.firstName}\n`;
      emailContent += `  Last Name: ${billing.lastName}\n`;
      emailContent += `  Address: ${billing.address}\n`;
      emailContent += `  Apartment/Suite: ${billing.apartment || "N/A"}\n`;
      emailContent += `  Postal Code: ${billing.postalCode}\n`;
      emailContent += `  Phone: ${billing.phone}\n`;
    }
    emailContent += `\n`;

    // --- Order Summary Section ---
    let orderSummaryContent = "";
    if (orderSummary) {
      orderSummaryContent += `Order Summary Details:\n`;
      orderSummaryContent += `  Item Name: ${orderSummary.itemName}\n`;
      orderSummaryContent += `  Price: KShs. ${orderSummary.itemPrice}\n`;
      orderSummaryContent += `  Discount Code: ${orderSummary.discountCode || "None"}\n`;
      orderSummaryContent += `  Shipping Cost: ${orderSummary.shippingCost}\n\n`;
      if (orderSummary.images && orderSummary.images.length > 0) {
        orderSummaryContent += `  Attached Images: ${orderSummary.images.length} file(s) attached.\n`;
      }
    }
    emailContent += orderSummaryContent;

    // --- Prepare the PDF with images ---
    const pdfFilePath = path.join(__dirname, "order_summary_images.pdf");
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfFilePath);
    doc.pipe(writeStream);

    // Add images to PDF
    if (orderSummary && orderSummary.images && orderSummary.images.length > 0) {
      orderSummary.images.forEach((img, index) => {
        const base64Data = img.includes("base64,") ? img.split("base64,")[1] : img;
        doc.addPage().image(Buffer.from(base64Data, "base64"), { fit: [500, 500] });
      });
    }

    doc.end();
    await new Promise((resolve) => writeStream.on("finish", resolve));

    // --- Email to Admin (plain text, with PDF attachment) ---
    const adminMailOptions = {
      from: "neatgarmsltd@zohomail.com",
      to: "neatgarmsltd@zohomail.com",
      subject: "New Pay Now Submission with Order Summary, Contact, Delivery & Payment Info",
      text: emailContent,
      attachments: [
        {
          filename: "order_summary_images.pdf",
          path: pdfFilePath,
        }
      ]
    };

    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log("Pay Now Email sent to Admin:", adminInfo.response);

    // --- Build the Autoresponse Email to the User (HTML Email) ---
    const autoResponse = {
      from: "neatgarmsltd@zohomail.com",
      to: contact.email,
      subject: "Order Confirmation - Thank You for Your Purchase!",
      html: `
        <p>Hello ${delivery.firstName},</p>
        <p>Thank you for your order! We have received your submission and are processing it. Here are your order details:</p>
        <ul>
          <li>Number of Items: ${itemCount}</li>
          <li>Selected Design: ${design}</li>
          <li>Payment Method: ${paymentMethod}</li>
        </ul>
        <h3>Delivery Address</h3>
        <p>
          ${delivery.firstName} ${delivery.lastName}<br/>
          ${delivery.address}${delivery.apartment ? ', ' + delivery.apartment : ''}<br/>
          ${delivery.city}, ${delivery.postalCode}<br/>
          ${delivery.country}<br/>
          Phone: ${delivery.phone}
        </p>
        <h3>Order Summary</h3>
        <p>
          Item Name: ${orderSummary.itemName}<br/>
          Price: KShs. ${orderSummary.itemPrice}<br/>
          Discount Code: ${orderSummary.discountCode || "None"}<br/>
          Shipping Cost: ${orderSummary.shippingCost}
        </p>
        <p>Please find the attached PDF with your images for download.</p>
        <p>We will notify you once your order has been shipped. If you have any questions, please contact us at neatgarms@zohomail.com.</p>
        <p>Thank you for choosing us!</p>
        <p>Best regards,<br/>Neatgarms</p>
      `,
      attachments: [
        {
          filename: "order_summary_images.pdf",
          path: pdfFilePath,
        }
      ]
    };

    const userInfo = await transporter.sendMail(autoResponse);
    console.log("Autoresponse sent to User:", userInfo.response);

    // Delete the PDF after sending
    fs.unlinkSync(pdfFilePath);

    res.json({ success: true, message: "Pay Now form submitted successfully!" });
  } catch (error) {
    console.error("Error sending Pay Now email:", error);
    res.status(500).json({ success: false, message: "Error sending Pay Now email" });
  }
});



// Handle Review Form Submission
app.post("/submit-review", upload.single("review-media"), async (req, res) => {
  try {
    const {
      "review-title": reviewTitle,
      "review-content": reviewContent,
      "reviewer-name": reviewerName,
      "reviewer-email": reviewerEmail,
      rating,
    } = req.body;

    console.log("Received Rating:", rating); // ✅ Debugging Line

    // Prepare attachment if file uploaded
    const attachments = [];
    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        content: req.file.buffer,
        contentType: req.file.mimetype,
      });
    }

    // Handle missing rating
    const ratingValue = rating ? `${rating} Stars` : "No rating selected";

    // Email to Your Inbox
    const mailOptions = {
      from: "neatgarmsltd@zohomail.com",
      to: "neatgarmsltd@zohomail.com", // Your inbox
      subject: `New Review Submission - ${reviewTitle}`,
      text: `You have received a new review:\n\nTitle: ${reviewTitle}\nContent: ${reviewContent}\nName: ${reviewerName}\nEmail: ${reviewerEmail}\nRating: ${ratingValue}`,
      attachments, // Include uploaded file if any
    };

    // Send Email to Yourself
    const info = await transporter.sendMail(mailOptions);
    console.log("Review email sent:", info.response);

    // Autoresponder to Reviewer
    const autoResponseOptions = {
      from: "neatgarmsltd@zohomail.com",
      to: reviewerEmail,
      subject: "Thank You for Your Review!",
      text: `Hi ${reviewerName},\n\nThank you for your review titled "${reviewTitle}". We appreciate your feedback!\n\nBest regards,\nYour Team`,
    };

    // Send Autoresponse
    const autoInfo = await transporter.sendMail(autoResponseOptions);
    console.log("Autoresponse sent:", autoInfo.response);

  } catch (error) {
    console.error("Error sending review email:", error);
    res.status(500).json({ success: false, message: "Error sending review email" });
  }
});


// Replace these with your actual credentials
const consumerKey = "4Zun3FJtqJ43ZVD6lFlU1VxEMfcXAiY5C34MAvel9JJt5EVV";
const consumerSecret = "LBhJDHp5r5i2kBjQ2Zuxhak513akpSPURGJE5gGgEIRToaGTx7Bq4luKUqqqR8MN";
const businessShortCode = "174379"; // Your Paybill number
const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"; // Your newly obtained passkey
const callbackURL = "https://7a0b-102-140-216-118.ngrok-free.app/mpesa-callback"; // Your callback URL

// Helper: Generate timestamp (as shown above)
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = ("0" + (now.getMonth() + 1)).slice(-2);
  const day = ("0" + now.getDate()).slice(-2);
  const hours = ("0" + now.getHours()).slice(-2);
  const minutes = ("0" + now.getMinutes()).slice(-2);
  const seconds = ("0" + now.getSeconds()).slice(-2);
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Helper: Generate the password
function generatePassword(businessShortCode, passkey, timestamp) {
  const dataToEncode = businessShortCode + passkey + timestamp;
  return Buffer.from(dataToEncode).toString("base64");
}

// Helper: Get access token from Safaricom
async function getAccessToken() {
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}

// Endpoint to initiate STK Push (triggered when customer clicks "Pay Now")
app.post("/paynow4", async (req, res) => {
  const { phone, amount } = req.body;
  if (!phone || !amount) {
    return res.status(400).json({ error: "Phone number and amount are required." });
  }
  
  try {
    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword(businessShortCode, passkey, timestamp);
    
    const payload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,             // Customer's phone number in international format, e.g., 2547XXXXXXXX
      PartyB: businessShortCode, // Your Paybill number
      PhoneNumber: phone,
      CallBackURL: callbackURL,
      AccountReference: "Neat Garms",  // Could be order number or brand name
      TransactionDesc: "Payment for clothing order"
    };
    
    const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    console.log("STK Push Response:", responseData);
    res.json(responseData);
  } catch (error) {
    console.error("Error initiating STK Push:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


const paymentStatus = {}; // Store payment confirmation status

// MPesa Callback Endpoint
app.post("/mpesa-callback", async (req, res) => {
  console.log("MPesa Callback Received:", req.body);
  const callbackData = req.body;

  if (!callbackData.Body.stkCallback) {
      return res.status(400).json({ error: "Invalid callback data" });
  }

  const stkCallback = callbackData.Body.stkCallback;

  // Check if the transaction was successful
  if (stkCallback.ResultCode === 0) {
      const phone = stkCallback.CallbackMetadata.Item.find(item => item.Name === "PhoneNumber").Value;
      const mpesaReceipt = stkCallback.CallbackMetadata.Item.find(item => item.Name === "MpesaReceiptNumber").Value;
      
      // Store the successful payment
      paymentStatus[phone] = { paid: true, receipt: mpesaReceipt };

      console.log(`✅ Payment confirmed for phone ${phone} with receipt ${mpesaReceipt}`);
      return res.status(200).json({ message: "Payment confirmed" });
  } else {
      console.log("❌ Payment failed:", stkCallback.ResultDesc);
      return res.status(400).json({ error: "Payment failed", reason: stkCallback.ResultDesc });
  }
});


app.get("/check-payment/:phone", (req, res) => {
  const phone = req.params.phone;

  // Check if test mode is enabled
  if (process.env.TEST_MODE === "true") {
      return res.json({ paid: false });  // Default to unpaid in test mode
  }

  // Check if the user has actually paid
  if (paymentStatus[phone] && paymentStatus[phone].paid) {
      return res.json({ paid: true, receipt: paymentStatus[phone].receipt });
  } else {
      return res.json({ paid: false });
  }
});





// API Route to Remove Background
app.post("/remove-bg", async (req, res) => {
  const { image } = req.body;

  if (!image) {
      return res.status(400).json({ error: "No image provided" });
  }

  try {
      // Send the request to the Python API
      const response = await axios.post("http://127.0.0.1:5001/remove-bg", { image });

      // Return the processed image from Python
      res.json({ processedImage: response.data.processedImage });
  } catch (error) {
      console.error("Error removing background:", error);
      res.status(500).json({ error: "Background removal failed" });
  }
});



// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



