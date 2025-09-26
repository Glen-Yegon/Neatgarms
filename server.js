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
import { fileURLToPath } from "url";
import { spawn } from "child_process";
// Webhook route to receive Paystack payment events
import crypto from 'crypto'; // ✅ If using ES Modules
import axios from "axios";
import sharp from "sharp";
import FormData from "form-data";   // if using ES modules


dotenv.config();
// Define your file path


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); 
const PORT = 5000;


// ✅ Trusted proxy (important if you're on Render or Vercel)
app.set("trust proxy", true);

// ✅ Allowed domains
const allowedOrigins = [
  "https://neatgarms-six.vercel.app",
  "http://127.0.0.1:5506",
  "https://www.neatgarms.com",
  "https://neatgarms.com"
];

// ✅ CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// ✅ Apply CORS globally
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight for all routes

// ✅ Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());



// Configure Multer for File Uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage  });


// Route to redirect to Zoho's authorization page
app.get("/auth/zoho", (req, res) => {
  const scope = encodeURIComponent("ZohoMail.messages.CREATE,ZohoMail.accounts.READ"); // request needed scopes
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=${scope}&client_id=${process.env.ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${encodeURIComponent(process.env.ZOHO_REDIRECT_URI)}&prompt=consent`;
  res.redirect(authUrl);
});

// OAuth callback: Zoho will redirect here with ?code=XXXX
app.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code in query string");

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", process.env.ZOHO_CLIENT_ID);
    params.append("client_secret", process.env.ZOHO_CLIENT_SECRET);
    params.append("redirect_uri", process.env.ZOHO_REDIRECT_URI);
    params.append("code", code);

    const tokenResp = await axios.post("https://accounts.zoho.com/oauth/v2/token", params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 15000,
    });

    // IMPORTANT: tokenResp.data contains access_token & refresh_token
    console.log("ZOHO TOKEN RESPONSE:", tokenResp.data);

    // Show instructions & tokens to you in the browser (copy the refresh token and put it in Render env)
    res.send(`<h2>Zoho OAuth success</h2>
      <p><strong>Copy the refresh_token value below and add it to your environment variables as ZOHO_REFRESH_TOKEN</strong> (do not commit this anywhere)</p>
      <pre>${JSON.stringify(tokenResp.data, null, 2)}</pre>
      <p>After copying the refresh token, add it in Render dashboard and restart the service.</p>`);
  } catch (err) {
    console.error("Error exchanging code for tokens:", err.response?.data || err.message);
    res.status(500).send("Token exchange failed (check server logs)");
  }
});



// ----------------- Zoho OAuth + Mail helpers -----------------
let _zohoAccessToken = null;
let _zohoAccessTokenExpiry = 0; // unix seconds
let _zohoAccountId = process.env.ZOHO_ACCOUNT_ID || null;

// Exchange refresh token -> access token (caches in memory)
async function getZohoAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (_zohoAccessToken && now < _zohoAccessTokenExpiry - 30) {
    return _zohoAccessToken;
  }

  if (!process.env.ZOHO_REFRESH_TOKEN || !process.env.ZOHO_CLIENT_ID || !process.env.ZOHO_CLIENT_SECRET) {
    throw new Error("Missing ZOHO_REFRESH_TOKEN or ZOHO_CLIENT_ID/SECRET in env");
  }

  const params = new URLSearchParams();
  params.append("refresh_token", process.env.ZOHO_REFRESH_TOKEN);
  params.append("client_id", process.env.ZOHO_CLIENT_ID);
  params.append("client_secret", process.env.ZOHO_CLIENT_SECRET);
  params.append("grant_type", "refresh_token");

  const resp = await axios.post("https://accounts.zoho.com/oauth/v2/token", params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    timeout: 15000,
  });

  _zohoAccessToken = resp.data.access_token;
  _zohoAccessTokenExpiry = now + (resp.data.expires_in || 3600);
  console.log("Zoho access token refreshed, expires_in:", resp.data.expires_in);
  return _zohoAccessToken;
}

// If accountId not in env, fetch accounts and pick the first; caches in memory
async function ensureZohoAccountId() {
  if (_zohoAccountId) return _zohoAccountId;

  const token = await getZohoAccessToken();
  const resp = await axios.get("https://mail.zoho.com/api/accounts", {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
    timeout: 15000,
  });

  // Zoho may return accounts under resp.data.data or resp.data.accounts — be defensive
  const accounts = resp.data.data || resp.data.accounts || resp.data;
  if (!Array.isArray(accounts) || accounts.length === 0) {
    console.error("Unexpected accounts response:", resp.data);
    throw new Error("No Zoho accounts found for this user");
  }

  // Try common id fields
  const id = accounts[0].id || accounts[0].accountId || accounts[0].account_id;
  if (!id) {
    console.error("Could not find account id, first account object:", accounts[0]);
    throw new Error("Could not determine Zoho account id");
  }

  _zohoAccountId = id;
  console.log("Zoho account id detected:", _zohoAccountId);

  // Optional: print this ID so you can copy it to env. You can also set ZOHO_ACCOUNT_ID in Render
  return _zohoAccountId;
}

// Send mail using Zoho Mail API (supports HTML and attachments)
async function sendZohoMail({ to, subject, htmlContent = null, textContent = null, attachments = [] }) {
  const token = await getZohoAccessToken();
  const accountId = await ensureZohoAccountId();

  const form = new FormData();
  form.append("fromAddress", process.env.ZOHO_FROM_ADDRESS || "info@neatgarms.com");

  // Zoho accepts toAddress as a comma separated string; pass as string
  if (Array.isArray(to)) form.append("toAddress", to.join(","));
  else form.append("toAddress", to);

  form.append("subject", subject);

  // content: prefer HTML if provided
  if (htmlContent) {
    form.append("content", htmlContent);
    form.append("mailFormat", "html");
  } else {
    form.append("content", textContent || "");
    form.append("mailFormat", "text");
  }

  // Attach files: attachments array elements => { filename, path }
  for (const file of attachments || []) {
    // file.path must point to a file on disk; if you only have buffers, write them to a temp file first.
    if (!file.path || !fs.existsSync(file.path)) {
      console.warn("Attachment missing or not found:", file);
      continue;
    }
    form.append("attachments", fs.createReadStream(file.path), { filename: file.filename || path.basename(file.path) });
  }

  const resp = await axios.post(
    `https://mail.zoho.com/api/accounts/${accountId}/messages`,
    form,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        ...form.getHeaders(),
      },
      maxBodyLength: Infinity,
      timeout: 20000,
    }
  );

  return resp.data;
}





app.post(
  "/submit-form",
  upload.fields([
    { name: "frontView", maxCount: 1 },
    { name: "backView", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { name, email, phone, quantity } = req.body;

      // Parse products
      const products = req.body.products ? JSON.parse(req.body.products) : [];

      // Generate PDF
      const pdfFilePath = path.join(__dirname, "uploaded_images.pdf");
      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream(pdfFilePath);
      doc.pipe(writeStream);

      doc.fontSize(16).text(`Form Submission Details`, { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Name: ${name}`);
      doc.text(`Email: ${email}`);
      doc.text(`Phone: ${phone}`);
      doc.text(`Quantity: ${quantity}`);
      doc.moveDown();

      // Add product details
      let productsSummary = "";
      products.forEach((prod, index) => {
        const i = index + 1;
        doc.text(`Product ${i}: Size ${prod.size}, Color ${prod.color}`);
        productsSummary += `\nProduct ${i}: Size ${prod.size}, Color ${prod.color}`;
      });
      doc.moveDown();

      // Add images
["frontView", "backView"].forEach((field) => {
  if (req.files[field]) {
    const fileBuffer = req.files[field][0].buffer;
    doc.addPage().image(fileBuffer, { fit: [500, 500] });
  }
});


      doc.end();
      await new Promise((resolve) => writeStream.on("finish", resolve));

      // Email to Admin
      const mailOptions = {
        from: "info@neatgarms.com",
        to: "info@neatgarms.com",
        subject: "New Custom Design Submission",
        text: `New submission:

Name: ${name}
Email: ${email}
Phone: ${phone}
Quantity: ${quantity}
${productsSummary}

See attached PDF for full details.`,
        attachments: [{ filename: "uploaded_images.pdf", path: pdfFilePath }],
      };

      await transporter.sendMail(mailOptions);

      // Autoresponse to user
      const autoResponseOptions = {
        from: '"Neatgarms" <info@neatgarms.com>',
        to: email,
        subject: "🪄 Magic in the Making: Your Neat Customs Order!",
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Neat Customs Teaser</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family: 'Century Gothic', Arial, sans-serif;
    }
    table { border-spacing: 0; width: 100%; }
    img { border: 0; display: block; line-height: 0; }
    .headline {
      font-size: 30px;
      letter-spacing: 2px;
      font-weight: 100;
      margin: 20px 0 0 0;
      line-height: 1.2;
      color: #ffffff;
    }
    .headline span {
      display: block;
      font-size: 28px;
      letter-spacing: 10px;
      margin-top: 10px;
      color: #ae866a;
    }
    .content {
      font-size: 16px;
      line-height: 1.6;
      color: #ffffff;
    }
    .cta {
      display: inline-block;
      margin-top: 30px;
      padding: 15px 30px;
      background-color: transparent;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 15px;
      font-weight: 100;
      border-bottom: 2px solid #8a9381;
      border-top: 2px solid #8a9381;
      font-size: 16px;
    }
    @media screen and (max-width:600px) {
      .headline { font-size:28px !important; letter-spacing:6px !important; }
      .headline span { font-size:20px !important; letter-spacing:4px !important; }
      .content { font-size:15px !important; padding:0 15px !important; }
    }
  </style>
</head>
<body>
  <center>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center">

          <!-- Hero Section -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:700px;">
            <tr>
              <td background="https://www.neatgarms.com/mains/brent.jpg"
                  bgcolor="#000000"
                  width="700"
                  height="500"
                  valign="middle"
                  style="background-position:center center; background-size:cover; text-align:center;">

                <!--[if gte mso 9]>
                <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:700px;height:500px;">
                  <v:fill type="frame" src="https://www.neatgarms.com/mains/brent.jpg" color="#000000" />
                  <v:textbox inset="0,0,0,0">
                <![endif]-->

                <table role="presentation" width="100%" height="500" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center" valign="middle" style="padding:40px 20px; background-color:rgba(0,0,0,0.55);">

                      <!-- Logo -->
                      <img src="https://www.neatgarms.com/mains/logo2.png" 
                           alt="Neat Customs Logo" width="120"
                           style="margin:0 auto 20px auto; display:block;">

                      <!-- Headline -->
                      <h1 class="headline" style="  font-family: Georgia, 'Times New Roman', serif; font-weight: 100; margin:0;">
                        Hi ${name}.
                      </h1>

<div class="content" style="margin:30px auto 0 auto; max-width:600px; font-family: 'Century Gothic', Arial, sans-serif;">
  <p>
    ✨ Welcome to the world of <span style="color:#ae866a; font-weight:bold;">Neat Customs</span>! ✨
  </p>
  <p>
    Your order has officially been sprinkled with a little magic and is now in the hands of our designers, ready to become something truly <strong>you</strong>. 🪄
  </p>
  <p>
    Every stitch, every color, every detail is being carefully crafted to turn your vision into a wearable masterpiece. Think of it as a collaboration between your imagination and our craftsmanship.
  </p>
  <p>
    Keep an eye on your inbox — we’ll be sending updates as your creation comes to life. And remember, you’re not just a customer, you’re a part of the Neat Customs family. 💛
  </p>
  <p>
    Thank you for trusting us with your ideas. Get ready to wear your dreams. 👕
  </p>
</div>


                        <!-- CTA -->
                        <a href="https://www.neatgarms.com/item.html" class="cta"
                           style="font-family: Arial, Helvetica, sans-serif;"> Another Custom Adventure?</a>
                      </div>

                    </td>
                  </tr>
                </table>

                <!--[if gte mso 9]>
                  </v:textbox>
                </v:rect>
                <![endif]-->

              </td>
            </tr>
          </table>
          <!-- End Hero Section -->

        </td>
      </tr>
    </table>
  </center>
</body>
</html>
<div>
    <br>
</div>
<div>
    <br>
</div>
<div class="zmail_signature_below">
    <div id="Zm-_Id_-Sgn" data-zbluepencil-ignore="true" data-sigid="5358557000000043004">
        <table style="font-family:Poppins, sans-serif; color:rgb(51, 51, 51); padding:12px 0; max-width:600px; line-height:1.4">
            <tbody>
                <tr>
                    <td style="vertical-align:top">
                        <table border="0" cellspacing="0" cellpadding="0" style="font-family:Poppins, sans-serif; color:rgb(51, 51, 51); padding:12px 0; max-width:600px; line-height:1.4">
                            <tbody>
                                <tr>
                                    <td style="vertical-align:top; padding-right:15px">
                                        <img style="border-radius:8px; display:block; background-color:transparent; border:0; outline:none" width="80" alt="Neat Garms Logo" src="https://www.neatgarms.com/mains/logo2.png">
                                    </td>
                                    <td style="vertical-align:top">
                                        <div>
                                            <b style="font-size:16px; color:rgb(174, 134, 106)">
                                                Neatgarms
                                            </b>
                                            <br>
                                        </div>
                                        <div>
                                            <a target="_blank" style="color:rgb(26, 115, 232); text-decoration:none; font-size:14px" href="mailto:info@neatgarms.com">
                                                info@neatgarms.com
                                            </a>
                                            <br>
                                        </div>
                                        <div>
                                            <a style="color:rgb(26, 115, 232); text-decoration:none; font-size:14px" target="_blank" href="https://www.neatgarms.com">
                                                www.neatgarms.com
                                            </a>
                                            <br>
                                        </div>
                                        <div style="margin-top:8px">
                                            <a style="margin-right:6px; text-decoration:none" target="_blank" href="https://instagram.com/neatgarms">
                                                <img style="display:inline-block; background-color:transparent; border:0; outline:none" width="20" alt="Instagram" src="https://www.neatgarms.com/images/insta.png">
                                            </a>
                                            <a style="margin-right:6px; text-decoration:none" target="_blank" href="https://wa.me/254758647031">
                                                <img style="display:inline-block; background-color:transparent; border:0; outline:none" width="20" alt="WhatsApp" src="https://www.neatgarms.com/images/whatsapp.png">
                                            </a>
                                            <a style="margin-right:6px; text-decoration:none" target="_blank" href="https://x.com/neatgarms">
                                                <img style="display:inline-block; background-color:transparent; border:0; outline:none" width="20" alt="X (Twitter)" src="https://www.neatgarms.com/images/x.png">
                                            </a>
                                            <a style="text-decoration:none" target="_blank" href="https://pinterest.com/neatgarms">
                                                <img style="display:inline-block; background-color:transparent; border:0; outline:none" width="20" alt="Pinterest" src="https://www.neatgarms.com/images/pins.png">
                                            </a>
                                            <br>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
        <div>
            <br>
        </div>
    </div>
</div>`,
      };
      await transporter.sendMail(autoResponseOptions);

      fs.unlinkSync(pdfFilePath);
      res.json({ success: true, message: "Form submitted successfully!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, message: "Error sending email" });
    }
  }
);




app.post("/pay-now", async (req, res) => {
  try {
    const { contact, delivery, billing, orderSummary } = req.body;

    // ---------------- Build email content ----------------
    let emailContent = `✅ Successful Form Submission:\n\n`;

    if (orderSummary && orderSummary.cartItems?.length > 0) {
      emailContent += `🛒 ORDER SUMMARY:\n\n`;
      orderSummary.cartItems.forEach((item, index) => {
        const cleanedPrice = (item.newPrice || "0").replace(/KSh|,/g, "").trim();
        const price = parseFloat(cleanedPrice) || 0;
        const quantity = parseInt(item.quantity) || 1;
        const totalPrice = price * quantity;

        emailContent += `Item ${index + 1}:\n`;
        emailContent += `- Name: ${item.name}\n`;
        emailContent += `- Brand: ${item.brand}\n`;
        emailContent += `- Price: KSh${price.toFixed(2)}\n`;
        emailContent += `- Quantity: ${quantity}\n`;
        if (item.size) emailContent += `- Size: ${item.size}\n`;
        if (item.color) emailContent += `- Color: ${item.color}\n`;
        emailContent += `- Total Price: KSh${totalPrice.toFixed(2)}\n\n`;
      });
      emailContent += `Estimated Total: KSh${orderSummary.estimatedTotal}\n\n`;
    } else {
      emailContent += `No items found in cart.\n\n`;
    }

    emailContent += `📞 CONTACT INFORMATION:\nEmail: ${contact.email}\nPhone: ${contact.phone}\n\n`;
    emailContent += `🚚 DELIVERY:\n${delivery.firstName} ${delivery.lastName}\n${delivery.address}\n${delivery.city}, ${delivery.country}\nPhone: ${delivery.phone}\n\n`;
    emailContent += `💳 BILLING:\n${billing.note || `${billing.firstName} ${billing.lastName}\n${billing.address}\n${billing.postalCode}`}\n\n`;

    // ---------------- Send Admin Email ----------------
    await sendZohoMail({
      to: process.env.ZOHO_FROM_ADDRESS, // sends to your admin email
      subject: "New Pay Now Submission (Neatgarms)",
      textContent: emailContent,
    });
    console.log("✅ Admin email sent via Zoho API");

    // ---------------- Send User Auto-response ----------------
    const userHtml = `
      <div style="font-family:sans-serif;padding:20px;">
        <h2>Thank you for your order with Neatgarms!</h2>
        <p>We have received your details. Below is your order summary:</p>
        <pre>${emailContent}</pre>
        <p>We’ll be in touch soon with shipping updates.</p>
      </div>
    `;

    await sendZohoMail({
      to: contact.email,
      subject: "Thank you — Neatgarms order received",
      htmlContent: userHtml,
    });
    console.log("✅ User autoresponse sent via Zoho API");

    res.json({ success: true, message: "Pay Now submitted & emails sent" });

  } catch (err) {
    console.error("❌ Error sending Pay Now email via Zoho API:", err.response?.data || err.message || err);
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
    let emailContent = `✅ Successful Form Submission:\n\n`;
    emailContent += `Number of Items: ${itemCount}\n\n`;

if (orderSummary) {
  emailContent += `🛒 ORDER SUMMARY:\n`;
  emailContent += `Product Name: ${orderSummary.name}\n`;
  emailContent += `Brand: ${orderSummary.brand}\n`;
  emailContent += `Image URL: ${orderSummary.image}\n`;
  emailContent += `Old Price: ${orderSummary.oldPrice}\n`;
  emailContent += `New Price: ${orderSummary.newPrice}\n`;
  emailContent += `Quantity: ${orderSummary.quantity}\n`;

  // Add size if available
  if (orderSummary.size) {
    emailContent += `Size: ${orderSummary.size}\n`;
  }

  // Add color if available
  if (orderSummary.color) {
    emailContent += `Color: ${orderSummary.color}\n`;
  }

  emailContent += `Total: KSh${orderSummary.total}\n`;
  emailContent += `Estimated Total: KSh${orderSummary.estimatedTotal}\n\n`;
}


    // --- Contact Information ---
    emailContent += `📞 CONTACT INFORMATION:\n`;
    emailContent += `Email: ${contact.email}\n`;
    emailContent += `Phone Number: ${contact.phone}\n`;
    emailContent += `Wants News & Offers: ${contact.newsOffers}\n\n`;

    // --- Delivery Information ---
    emailContent += `🚚 DELIVERY INFORMATION:\n`;
    emailContent += `Country/Region: ${delivery.country}\n`;
    emailContent += `First Name: ${delivery.firstName}\n`;
    emailContent += `Last Name: ${delivery.lastName}\n`;
    emailContent += `Address: ${delivery.address}\n`;
    emailContent += `Apartment/Suite: ${delivery.apartment}\n`;
    emailContent += `City: ${delivery.city}\n`;
    emailContent += `Postal Code: ${delivery.postalCode}\n`;
    emailContent += `Phone: ${delivery.phone}\n`;


    // --- Billing Information ---
    emailContent += `💳 BILLING INFORMATION:\n`;
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

    let userOrderDetails = '';

if (orderSummary) {
  userOrderDetails += `🛒 ORDER SUMMARY:\n`;
  userOrderDetails += `Product Name: ${orderSummary.name}\n`;
  userOrderDetails += `Brand: ${orderSummary.brand}\n`;
  userOrderDetails += `Image URL: ${orderSummary.image}\n`;
  userOrderDetails += `Old Price: ${orderSummary.oldPrice}\n`;
  userOrderDetails += `New Price: ${orderSummary.newPrice}\n`;
  userOrderDetails += `Quantity: ${orderSummary.quantity}\n`;

  if (orderSummary.size) {
    userOrderDetails += `Size: ${orderSummary.size}\n`;
  }

  if (orderSummary.color) {
    userOrderDetails += `Color: ${orderSummary.color}\n`;
  }

  userOrderDetails += `Total: KSh${orderSummary.total}\n`;
  userOrderDetails += `Estimated Total: KSh${orderSummary.estimatedTotal}\n`;
}



     // Email to Admin
     const adminMailOptions = {
      from: "info@neatgarms.com",
      to: "info@neatgarms.com",
      subject: "New Pay Now Submission with Order Summary, Contact, Delivery, Billing & Payment Info",
      text: emailContent,
    };

    // Send Email to Admin
    const info = await transporter.sendMail(adminMailOptions);
    console.log("Pay Now Email sent to admin:", info.response);


    const userMailOptions = {
      from: '"Neatgarms" <info@neatgarms.com>', 
      to: contact.email,
      subject: "Thank You for Your Order with Neatgarms! ",
      html: `
<div style="  font-family: 'Dream Avenue', sans-serif;  color: #1a1a1a; max-width: 700px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; background: #f9f9f9;">

  <div style="text-align: center;">
    <img src="https://www.neatgarms.com/mains/logo2.png" alt="Neatgarms Logo" style="height: 60px; margin-bottom: 10px;" />
  </div>
    
        <h2 style="color: #333;">👋 Hi ${delivery.firstName},</h2>
        <p style="font-size: 15px;">
          Thanks for shopping with <strong>Neatgarms</strong>! <br/>
          Your order was received and is being processed. We’ll notify you once it ships.
        </p>
    
        <h3 style="margin-top: 24px; color: #222;">🛍 Order Details</h3>
        <pre style="background: #fff; padding: 16px; border-radius: 10px; font-size: 14px; line-height: 1.5; border: 1px solid #ddd; white-space: pre-wrap;">${userOrderDetails}</pre>
    
    
        <h3 style="margin-top: 20px; color: #222;">🚚 Delivery Address</h3>
        <p style="background: #fff; padding: 16px; border-radius: 10px; font-size: 14px; line-height: 1.6; border: 1px solid #ddd;">
          ${delivery.firstName} ${delivery.lastName}<br/>
          ${delivery.address}, ${delivery.city}, ${delivery.country}<br/>
          ${delivery.postalCode}<br/>
          <strong>Phone:</strong> ${delivery.phone}
        </p>

          <div style="margin: 30px 0; padding: 20px; background: #8a9381; border: 1px solid black; border-radius: 10px;">
    <h3 style="color: black;">🪄 A Special Thank You</h3>
    <p style="font-size: 15px; line-height: 1.6;">
      Thank you for your purchase! Your merch has been gently taken from our Neat shelves by gloved hands and lovingly packed by our Omashu packing specialist under candlelight. After a glorious celebration, the town of Nairobi cheered as your package departed aboard our private baby jet. You’re now officially our “Customer of the Year,” with your photo proudly on our wall. We had a magical time packing your order—and we can’t wait for your next visit. <strong>KEEPITNEAT!</strong>
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;" />

    
        <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;" />
    
        <h3 style="color: #333;">🔥 Top Neat Picks for This Week</h3>
        <table style="width: 100%; border-spacing: 16px 10px;">
          <tr>
            <td align="center">
              <a href="https://www.neatgarms.com/tops.html" target="_blank">
                <img src="https://www.neatgarms.com/shoot/c.avif" alt="Urban Tee"width="140" style="border-radius: 4px;" />
                <p style="margin: 8px 0;">Work Shirt</p>
              </a>
            </td>
            <td align="center">
              <a href="https://www.neatgarms.com/pants.html" target="_blank">
                <img src="https://www.neatgarms.com/shoot/whitep2.avif" alt="Classic Hoodie" width="140" style="border-radius: 4px;" />
                <p style="margin: 8px 0;">Marble Wide Leg Pants</p>
              </a>
            </td>
          </tr>
        </table>
    
        <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;" />
    
        <h3 style="color: #333;">💸 Special Offer Just for You</h3>
        <p style="font-size: 14px;">Use code <strong style="color: #e63946;">NEAT20</strong> to get <strong>20% off</strong> your next order.</p>
    
        <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;" />
    
        <h3 style="color: black;">📞 Need Help?</h3>
        <p style="font-size: 14px;">Contact us anytime:</p>
        <ul style="line-height: 1.8; font-size: 14px;">
            <li><strong>Phone:</strong> +254 758 647 031</li>
        </ul>
    
        <p style="margin-top: 30px; font-size: 13px; color: #666;">Thanks again for choosing Neatgarms! We can't wait for you to rock your new look! 😎✨</p>
        <p style="font-size: 13px; color: #aaa;">© ${new Date().getFullYear()} Neatgarms Ltd. All rights reserved.</p>
      </div>


<table style="font-family: Poppins, sans-serif; color: #333333; padding: 12px 0; max-width: 600px; line-height: 1.4;">
  <tr>
    <td style="vertical-align: top; padding-right: 15px;">
      <img src="https://www.neatgarms.com/mains/logo2.png" alt="Neat Garms Logo" width="80" style="border-radius: 8px; display: block;">
    </td>
    <td style="vertical-align: top;">
      <strong style="font-size: 16px; color: #ae866a;">Neatgarms</strong><br>
      <a href="mailto:info@neatgarms.com" style="color: #1a73e8; text-decoration: none; font-size: 14px;">info@neatgarms.com</a><br>
      <a href="https://www.neatgarms.com" target="_blank" style="color: #1a73e8; text-decoration: none; font-size: 14px;">www.neatgarms.com</a>
      <div style="margin-top: 8px;">
        <a href="https://instagram.com/neatgarms" target="_blank" style="margin-right: 6px;">
          <img src="https://www.neatgarms.com/images/insta.png" alt="Instagram" width="20" style="display: inline;">
        </a>
        <a href="https://wa.me/254758647031" target="_blank" style="margin-right: 6px;">
          <img src="https://www.neatgarms.com/images/whatsapp.png" alt="WhatsApp" width="20" style="display: inline;">
        </a>
        <a href="https://x.com/neatgarms" target="_blank" style="margin-right: 6px;">
          <img src="https://www.neatgarms.com/images/x.png" alt="X (Twitter)" width="20" style="display: inline;">
        </a>
        <a href="https://pinterest.com/neatgarms" target="_blank">
          <img src="https://www.neatgarms.com/images/pins.png" alt="Pinterest" width="20" style="display: inline;">
        </a>
      </div>
    </td>
  </tr>
</table>

      `
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
      sizes,
      contact,
      delivery,
      billing,
      orderSummary
    } = req.body;

    // --- Build the Admin Email (Plain Text) ---
    let emailContent = `New Pay Now Submission:\n\n`;

// Order Details (custom options)
emailContent += `Ordered Sizes:\n`;
if (Array.isArray(sizes) && sizes.length > 0) {
  sizes.forEach((item, index) => {
    emailContent += `  ${index + 1}. Size: ${item.size} - Quantity: ${item.quantity}\n`;
  });
} else {
  emailContent += `  No sizes selected.\n`;
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
      from: "info@neatgarms.com",
      to: "info@neatgarms.com",
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
  from: '"Neatgarms" <info@neatgarms.com>',
  to: contact.email,
  subject: "🪄 Magic in the Making: Your Neat Customs Order!",
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Neat Customs Teaser</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family: 'Century Gothic', Arial, sans-serif;
    }
    table { border-spacing: 0; width: 100%; }
    img { border: 0; display: block; line-height: 0; }
    .headline {
      font-size: 30px;
      letter-spacing: 2px;
      font-weight: 100;
      margin: 20px 0 0 0;
      line-height: 1.2;
      color: #ffffff;
    }
    .headline span {
      display: block;
      font-size: 28px;
      letter-spacing: 10px;
      margin-top: 10px;
      color: #ae866a;
    }
    .content {
      font-size: 16px;
      line-height: 1.6;
      color: #ffffff;
    }
    .cta {
      display: inline-block;
      margin-top: 30px;
      padding: 15px 30px;
      background-color: transparent;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 15px;
      font-weight: 100;
      border-bottom: 2px solid #8a9381;
      border-top: 2px solid #8a9381;
      font-size: 16px;
    }
    @media screen and (max-width:600px) {
      .headline { font-size:28px !important; letter-spacing:6px !important; }
      .headline span { font-size:20px !important; letter-spacing:4px !important; }
      .content { font-size:15px !important; padding:0 15px !important; }
    }
  </style>
</head>
<body>
  <center>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center">

          <!-- Hero Section -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:700px;">
            <tr>
              <td background="https://www.neatgarms.com/mains/brent.jpg"
                  bgcolor="#000000"
                  width="700"
                  height="500"
                  valign="middle"
                  style="background-position:center center; background-size:cover; text-align:center;">

                <!--[if gte mso 9]>
                <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:700px;height:500px;">
                  <v:fill type="frame" src="https://www.neatgarms.com/mains/brent.jpg" color="#000000" />
                  <v:textbox inset="0,0,0,0">
                <![endif]-->

                <table role="presentation" width="100%" height="500" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center" valign="middle" style="padding:40px 20px; background-color:rgba(0,0,0,0.55);">

                      <!-- Logo -->
                      <img src="https://www.neatgarms.com/mains/logo2.png" 
                           alt="Neat Customs Logo" width="120"
                           style="margin:0 auto 20px auto; display:block;">

                      <!-- Headline -->
                      <h1 class="headline" style="  font-family: Georgia, 'Times New Roman', serif; font-weight: 100; margin:0;">
                        Heyy There.
                      </h1>

<div class="content" style="margin:30px auto 0 auto; max-width:600px; font-family: 'Century Gothic', Arial, sans-serif;">
  <p>
    ✨ Welcome to the world of <span style="color:#ae866a; font-weight:bold;">Neat Customs</span>! ✨
  </p>
  <p>
    Your order has officially been sprinkled with a little magic and is now in the hands of our designers, ready to become something truly <strong>you</strong>. 🪄
  </p>
  <p>
    Every stitch, every color, every detail is being carefully crafted to turn your vision into a wearable masterpiece. Think of it as a collaboration between your imagination and our craftsmanship.
  </p>
  <p>
    Keep an eye on your inbox — we’ll be sending updates as your creation comes to life. And remember, you’re not just a customer, you’re a part of the Neat Customs family. 💛
  </p>
  <p>
    Thank you for trusting us with your ideas. Get ready to wear your dreams. 👕
  </p>
</div>


                        <!-- CTA -->
                        <a href="https://www.neatgarms.com/item.html" class="cta"
                           style="font-family: Arial, Helvetica, sans-serif;"> Another Custom Adventure?</a>
                      </div>

                    </td>
                  </tr>
                </table>

                <!--[if gte mso 9]>
                  </v:textbox>
                </v:rect>
                <![endif]-->

              </td>
            </tr>
          </table>
          <!-- End Hero Section -->

        </td>
      </tr>
    </table>
  </center>
</body>
</html>
<div>
    <br>
</div>
<div>
    <br>
</div>
<div class="zmail_signature_below">
    <div id="Zm-_Id_-Sgn" data-zbluepencil-ignore="true" data-sigid="5358557000000043004">
        <table style="font-family:Poppins, sans-serif; color:rgb(51, 51, 51); padding:12px 0; max-width:600px; line-height:1.4">
            <tbody>
                <tr>
                    <td style="vertical-align:top">
                        <table border="0" cellspacing="0" cellpadding="0" style="font-family:Poppins, sans-serif; color:rgb(51, 51, 51); padding:12px 0; max-width:600px; line-height:1.4">
                            <tbody>
                                <tr>
                                    <td style="vertical-align:top; padding-right:15px">
                                        <img style="border-radius:8px; display:block; background-color:transparent; border:0; outline:none" width="80" alt="Neat Garms Logo" src="https://www.neatgarms.com/mains/logo2.png">
                                    </td>
                                    <td style="vertical-align:top">
                                        <div>
                                            <b style="font-size:16px; color:rgb(174, 134, 106)">
                                                Neatgarms
                                            </b>
                                            <br>
                                        </div>
                                        <div>
                                            <a target="_blank" style="color:rgb(26, 115, 232); text-decoration:none; font-size:14px" href="mailto:info@neatgarms.com">
                                                info@neatgarms.com
                                            </a>
                                            <br>
                                        </div>
                                        <div>
                                            <a style="color:rgb(26, 115, 232); text-decoration:none; font-size:14px" target="_blank" href="https://www.neatgarms.com">
                                                www.neatgarms.com
                                            </a>
                                            <br>
                                        </div>
                                        <div style="margin-top:8px">
                                            <a style="margin-right:6px; text-decoration:none" target="_blank" href="https://instagram.com/neatgarms">
                                                <img style="display:inline-block; background-color:transparent; border:0; outline:none" width="20" alt="Instagram" src="https://www.neatgarms.com/images/insta.png">
                                            </a>
                                            <a style="margin-right:6px; text-decoration:none" target="_blank" href="https://wa.me/254758647031">
                                                <img style="display:inline-block; background-color:transparent; border:0; outline:none" width="20" alt="WhatsApp" src="https://www.neatgarms.com/images/whatsapp.png">
                                            </a>
                                            <a style="margin-right:6px; text-decoration:none" target="_blank" href="https://x.com/neatgarms">
                                                <img style="display:inline-block; background-color:transparent; border:0; outline:none" width="20" alt="X (Twitter)" src="https://www.neatgarms.com/images/x.png">
                                            </a>
                                            <a style="text-decoration:none" target="_blank" href="https://pinterest.com/neatgarms">
                                                <img style="display:inline-block; background-color:transparent; border:0; outline:none" width="20" alt="Pinterest" src="https://www.neatgarms.com/images/pins.png">
                                            </a>
                                            <br>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
        <div>
            <br>
        </div>
    </div>
</div>
  `,
  attachments: [
    {
      filename: "order_summary_images.pdf",
      path: pdfFilePath,
    },
  ],
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
      from: "info@neatgarms.com",
      to: "info@neatgarms.com", // Your inbox
      subject: `New Review Submission - ${reviewTitle}`,
      text: `You have received a new review:\n\nTitle: ${reviewTitle}\nContent: ${reviewContent}\nName: ${reviewerName}\nEmail: ${reviewerEmail}\nRating: ${ratingValue}`,
      attachments, // Include uploaded file if any
    };

    // Send Email to Yourself
    const info = await transporter.sendMail(mailOptions);
    console.log("Review email sent:", info.response);

    // Autoresponder to Reviewer
    const autoResponseOptions = {
      from: '"Neatgarms" <info@neatgarms.com>', 
      to: reviewerEmail,
      subject: "Thank You for Your Review!",
      html: `Hi ${reviewerName},\n\nThank you for your review titled "${reviewTitle}". We appreciate your feedback!\n\nBest regards,\nNeat Team

<table style="font-family: Poppins, sans-serif; color: #333333; padding: 12px 0; max-width: 600px; line-height: 1.4;">
  <tr>
    <td style="vertical-align: top; padding-right: 15px;">
      <img src="https://www.neatgarms.com/mains/logo2.png" alt="Neat Garms Logo" width="80" style="border-radius: 8px; display: block;">
    </td>
    <td style="vertical-align: top;">
      <strong style="font-size: 16px; color: #ae866a;">Neatgarms</strong><br>
      <a href="mailto:info@neatgarms.com" style="color: #1a73e8; text-decoration: none; font-size: 14px;">info@neatgarms.com</a><br>
      <a href="https://www.neatgarms.com" target="_blank" style="color: #1a73e8; text-decoration: none; font-size: 14px;">www.neatgarms.com</a>
      <div style="margin-top: 8px;">
        <a href="https://instagram.com/neatgarms" target="_blank" style="margin-right: 6px;">
          <img src="https://www.neatgarms.com/images/insta.png" alt="Instagram" width="20" style="display: inline;">
        </a>
        <a href="https://wa.me/254758647031" target="_blank" style="margin-right: 6px;">
          <img src="https://www.neatgarms.com/images/whatsapp.png" alt="WhatsApp" width="20" style="display: inline;">
        </a>
        <a href="https://x.com/neatgarms" target="_blank" style="margin-right: 6px;">
          <img src="https://www.neatgarms.com/images/x.png" alt="X (Twitter)" width="20" style="display: inline;">
        </a>
        <a href="https://pinterest.com/neatgarms" target="_blank">
          <img src="https://www.neatgarms.com/images/pins.png" alt="Pinterest" width="20" style="display: inline;">
        </a>
      </div>
    </td>
  </tr>
</table>

  `,
    };

    // Send Autoresponse
    const autoInfo = await transporter.sendMail(autoResponseOptions);
    console.log("Autoresponse sent:", autoInfo.response);

  } catch (error) {
    console.error("Error sending review email:", error);
    res.status(500).json({ success: false, message: "Error sending review email" });
  }
});

/*
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
  */

// Endpoint to initiate STK Push (triggered when customer clicks "Pay Now")
/*
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
*/


// Handle subscription form
app.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  // Email to yourself
  const notifyAdmin = {
    from: 'info@neatgarms.com',
    to: 'info@neatgarms.com',
    subject: 'New Email Subscriber',
    text: `You have a new subscriber: ${email}`,
  };

  // Auto-response to subscriber
  const autoReply = {
    from: '"Neatgarms" <info@neatgarms.com>', 
    to: email,
    subject: 'Thanks for subscribing to Neatgarms!',
    html: `
    <div style="font-family: 'poppins', sans-serif; text-align: center; padding: 20px;">
  <div style="text-align: center;">
    <img src="https://www.neatgarms.com/mains/logo2.png" alt="Neatgarms Logo" style="height: 60px; margin-bottom: 10px;" />
  </div>
  <p style="font-size: 16px; margin: 0 0 15px;">Hi there,</p>
  <p style="font-size: 16px; margin: 0 0 15px;">
    You are now part of the <strong>Neat Team</strong>! 
  </p>
  <p style="font-size: 16px; margin: 0 0 15px;">
    You'll be the first to hear about our latest collections, exclusive offers, and style updates.
  </p>
  <p style="font-size: 16px; margin: 0 0 15px;">Stay tuned!</p>
  <p style="font-size: 16px; margin-top: 30px;">Best Regards,<br/>The Neat Team</p>
</div>

    
<table style="font-family: Poppins, sans-serif; color: #333333; padding: 12px 0; max-width: 600px; line-height: 1.4;">
  <tr>
    <td style="vertical-align: top; padding-right: 15px;">
      <img src="https://www.neatgarms.com/mains/logo2.png" alt="Neat Garms Logo" width="80" style="border-radius: 8px; display: block;">
    </td>
    <td style="vertical-align: top;">
      <strong style="font-size: 16px; color: #ae866a;">Neatgarms</strong><br>
      <a href="mailto:info@neatgarms.com" style="color: #1a73e8; text-decoration: none; font-size: 14px;">info@neatgarms.com</a><br>
      <a href="https://www.neatgarms.com" target="_blank" style="color: #1a73e8; text-decoration: none; font-size: 14px;">www.neatgarms.com</a>
      <div style="margin-top: 8px;">
        <a href="https://instagram.com/neatgarms" target="_blank" style="margin-right: 6px;">
          <img src="https://www.neatgarms.com/images/insta.png" alt="Instagram" width="20" style="display: inline;">
        </a>
        <a href="https://wa.me/254758647031" target="_blank" style="margin-right: 6px;">
          <img src="https://www.neatgarms.com/images/whatsapp.png" alt="WhatsApp" width="20" style="display: inline;">
        </a>
        <a href="https://x.com/neatgarms" target="_blank" style="margin-right: 6px;">
          <img src="https://www.neatgarms.com/images/x.png" alt="X (Twitter)" width="20" style="display: inline;">
        </a>
        <a href="https://pinterest.com/neatgarms" target="_blank">
          <img src="https://www.neatgarms.com/images/pins.png" alt="Pinterest" width="20" style="display: inline;">
        </a>
      </div>
    </td>
  </tr>
</table>



  `,
  };

  try {
    await transporter.sendMail(notifyAdmin);
    await transporter.sendMail(autoReply);
    res.status(200).json({ message: 'Subscription email sent successfully.' });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ message: 'Failed to send emails.' });
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
      const response = await axios.post("http://127.0.0.1:10000/remove-bg", { image });

      // Return the processed image from Python
      res.json({ processedImage: response.data.processedImage });
  } catch (error) {
      console.error("Error removing background:", error);
      res.status(500).json({ error: "Background removal failed" });
  }
});


app.post('/api/payment-cancelled', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  // Email to customer to follow up
  const followUpEmail = {
    from: '"Neatgarms" <info@neatgarms.com>',
    to: email,
    subject: 'We Noticed You Didn’t Complete Your Purchase',
    html: `
    <div style="font-family: 'Poppins', sans-serif; padding: 20px; max-width: 600px; margin: auto;">
      <div style="text-align: center;">
        <img src="https://www.neatgarms.com/mains/logo2.png" alt="Neatgarms Logo" style="height: 60px; margin-bottom: 15px;" />
      </div>
      <p style="font-size: 16px;">Hi there,</p>
      <p style="font-size: 16px;">
        We noticed you didn’t complete your purchase. Was there a problem during checkout? 
        If you encountered any difficulties, we’re here to help.
      </p>
      <p style="font-size: 16px;">
        We'd love to have you back! Your items are still waiting for you — and we might even throw in something special if you return soon. 😉
      </p>
      <a href="https://www.neatgarms.com/cart.html" style="display: inline-block; margin-top: 20px; padding: 12px 20px; background: #ae866a; color: white; text-decoration: none; border-radius: 6px;">Complete My Order</a>
      <p style="margin-top: 30px; font-size: 14px;">Need help? Reach out to us at <a href="mailto:info@neatgarms.com">info@neatgarms.com</a></p>
    </div>

    

<table style="font-family: Poppins, sans-serif; color: #333333; padding: 12px 0; max-width: 600px; line-height: 1.4;">
  <tr>
    <td style="vertical-align: top; padding-right: 15px;">
      <img src="https://www.neatgarms.com/mains/logo2.png" alt="Neat Garms Logo" width="80" style="border-radius: 8px; display: block;">
    </td>
    <td style="vertical-align: top;">
      <strong style="font-size: 16px; color: #ae866a;">Neatgarms</strong><br>
      <a href="mailto:info@neatgarms.com" style="color: #1a73e8; text-decoration: none; font-size: 14px;">info@neatgarms.com</a><br>
      <a href="https://www.neatgarms.com" target="_blank" style="color: #1a73e8; text-decoration: none; font-size: 14px;">www.neatgarms.com</a>
      <div style="margin-top: 8px;">
        <a href="https://instagram.com/neatgarms" target="_blank" style="margin-right: 6px;">
          <img src="https://www.neatgarms.com/images/insta.png" alt="Instagram" width="20" style="display: inline;">
        </a>
        <a href="https://wa.me/254758647031" target="_blank" style="margin-right: 6px;">
          <img src="https://www.neatgarms.com/images/whatsapp.png" alt="WhatsApp" width="20" style="display: inline;">
        </a>
        <a href="https://x.com/neatgarms" target="_blank" style="margin-right: 6px;">
          <img src="https://www.neatgarms.com/images/x.png" alt="X (Twitter)" width="20" style="display: inline;">
        </a>
        <a href="https://pinterest.com/neatgarms" target="_blank">
          <img src="https://www.neatgarms.com/images/pins.png" alt="Pinterest" width="20" style="display: inline;">
        </a>
      </div>
    </td>
  </tr>
</table>

    `
  };

  try {
    await transporter.sendMail(followUpEmail);
    res.status(200).json({ message: 'Cancellation follow-up email sent.' });
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    res.status(500).json({ message: 'Failed to send follow-up email.' });
  }
});



// ✅ Use only in the backend
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// ✅ Verify transaction route
app.post('/api/paystack/verify', async (req, res) => {
  const { reference } = req.body;

  // 🛑 Validate input
  if (!reference) {
    return res.status(400).json({
      status: false,
      message: '❌ Transaction reference is required.',
    });
  }

  try {
    // 🔍 Request to Paystack
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;

    // ✅ Payment successful
    if (data.status && data.data.status === 'success') {
      return res.status(200).json({
        status: true,
        message: '✅ Payment verified successfully.',
        transaction: data.data,
      });
    }

    // ❌ Payment was not successful
    return res.status(400).json({
      status: false,
      message: '❌ Payment not successful or pending.',
      transaction: data.data,
    });

  } catch (error) {
    const errData = error.response?.data || error.message;
    console.error('🚫 Error verifying payment:', errData);

    return res.status(500).json({
      status: false,
      message: '🚫 Server error while verifying payment.',
      error: errData,
    });
  }
});





app.post("/api/paystack/webhook",
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString(); // Required for signature verification
    }
  }),
  async (req, res) => {
    const paystackSignature = req.headers['x-paystack-signature'];

    // ✅ Always use the SECRET key (same as in dashboard) — not the PUBLIC one
    const secret = 'REMOVED_SECRET'; // Ideally use process.env

    const hash = crypto
      .createHmac('sha512', secret)
      .update(req.rawBody)
      .digest('hex');

    if (hash !== paystackSignature) {
      console.log("❌ Webhook signature mismatch");
      return res.sendStatus(401);
    }

    const event = req.body;

    // ✅ Handle only successful charge events
    if (event.event === 'charge.success') {
      const paymentData = event.data;
      const email = paymentData.customer?.email;
      const amount = paymentData.amount / 100;
      const reference = paymentData.reference;
      const channel = paymentData.channel;

      console.log("✅ Webhook verified:", {
        reference,
        amount,
        email,
        channel
      });

      // TODO: Save to DB or mark order as paid
    }

    res.sendStatus(200); // ✅ Must respond 200 or Paystack retries
  }
);




app.get("/keep-alive", (req, res) => {
  res.send("Server is awake!");
});



// Optional: redirect /page.html to /page (so URL looks clean)
app.get('/:page.html', (req, res) => {
    const page = req.params.page;
    res.redirect(`/${page}`);
});

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.get("/cors-test", (req, res) => {
  res.json({ message: "CORS is working properly." });
});


app.use(express.static(path.join(__dirname, 'home')));


// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

