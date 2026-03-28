const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Detect environment (Local vs Hostinger)
// If index.html exists in __dirname, we are in Hostinger's flat structure.
// Otherwise, we are in local nested structure (nodeapp/).
const isFlatStructure = fs.existsSync(path.join(__dirname, 'index.html'));
const ROOT_DIR = isFlatStructure ? __dirname : path.join(__dirname, '../');

console.log(`Running in ${isFlatStructure ? 'FLAT (Hostinger)' : 'NESTED (Local)'} mode. Root: ${ROOT_DIR}`);

// Serve static files from ROOT_DIR for CSS/Images
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});
app.use(express.static(ROOT_DIR, { index: false, extensions: ['html'] }));

app.use(session({
    secret: 'spirezen_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Helper to get users
function getUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading users.json:", err);
        return [];
    }
}

// Routes
app.get('/', (req, res) => {
    // Serve the public landing page
    res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

// Dynamic route for any HTML page
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    // Prevent directory traversal
    if (page.includes('..') || page.includes('/')) {
        return next();
    }

    const filePath = path.join(ROOT_DIR, `${page}.html`);
    const filePathDirect = path.join(ROOT_DIR, page); // For files that might already have extensions or be folders

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else if (fs.existsSync(filePathDirect) && fs.lstatSync(filePathDirect).isFile()) {
        res.sendFile(filePathDirect);
    } else {
        next(); // Pass to 404 or other routes
    }
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Please enter both email and password');
    }

    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.send('Invalid credentials <a href="/login">Try Again</a>');
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (match) {
        req.session.user = {
            email: user.email,
            name: user.name,
            designation: user.designation
        };
        return res.redirect('/dashboard');
    } else {
        return res.send('Invalid credentials <a href="/login">Try Again</a>');
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/standup', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    // Read index.html template
    const filePath = path.join(__dirname, 'views', 'standup.html');
    fs.readFile(filePath, 'utf8', (err, html) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error loading page');
        }

        // HTML for User Info
        const userInfoHtml = `
            <div class="user-info-display" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1); text-align: left;">
                <p style="margin: 0; color: #eec063; font-weight: 600; font-family: 'Poppins', sans-serif;">Logged in as:</p>
                <p style="margin: 5px 0 0; color: #fff; font-size: 1.1em;">${req.session.user.name}</p>
                <p style="margin: 5px 0 0; color: #aaa; font-size: 0.9em; font-style: italic;">${req.session.user.designation}</p>
            </div>
        `;

        // Inject into placeholder
        const finalHtml = html.replace('<!-- USER_INFO_PLACEHOLDER -->', userInfoHtml);
        res.send(finalHtml);
    });
});


// Handle Standup Submission
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzt9Ei4QyybHOjYZvEpbxF4iDLClUXwXyZAZ9RchNrqSB6lA2pRSZbDS1dJpfBPPKgD/exec';

app.post('/standup', async (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('Unauthorized');
    }

    const { date, completed, working_on, blockers } = req.body;
    const user = req.session.user;

    const entry = `
---------------------------------------------------
Date: ${date}
User: ${user.name} (${user.designation})
Submission Time: ${new Date().toLocaleString()}

1. Completed Yesterday:
${completed}

2. Working On Today:
${working_on}

3. Blockers:
${blockers}
---------------------------------------------------
`;

    // 1. Save to local file (Backup)
    fs.appendFile(path.join(__dirname, 'standups.txt'), entry, (err) => {
        if (err) console.error("Error saving local file:", err);
    });

    // 2. Send to Google Sheets
    try {
        if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
            await axios.post(GOOGLE_SCRIPT_URL, {
                date: date,
                user: `${user.name} (${user.designation})`,
                completed: completed,
                working_on: working_on,
                blockers: blockers
            });
        } else {
            console.log("Google Script URL not configured. Skipping Sheet update.");
        }
    } catch (error) {
        console.error("Error sending to Google Sheets:", error.message);
        // We don't block the user response if external API fails, but we log it.
    }

    // Send Success Page with Dynamic Content
    const successPath = path.join(__dirname, 'views', 'success.html');
    fs.readFile(successPath, 'utf8', (err, html) => {
        if (err) return res.status(500).send("Error loading success page");

        const finalHtml = html
            .replace('<!-- TITLE_PLACEHOLDER -->', 'Report Submitted!')
            .replace('<!-- MESSAGE_PLACEHOLDER -->', 'Your daily standup report has been securely saved to the database and synced with Google Sheets.');

        res.send(finalHtml);
    });
});

const otpStore = new Map(); // Stores { email: { otp, expires } }

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.json({ success: false, message: "Email not found." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email, { otp, expires });

    const mailOptions = {
        from: transporter.options.auth.user,
        to: email,
        subject: 'Password Reset OTP - Spirezen',
        text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        // console.log(`[SIMULATED EMAIL] To: ${email}, OTP: ${otp}`);
        res.json({ success: true, message: "OTP sent to your email." });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.json({ success: false, message: "Failed to send OTP." });
    }
});

app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);

    if (!stored) {
        return res.json({ success: false, message: "No OTP request found." });
    }

    if (Date.now() > stored.expires) {
        otpStore.delete(email);
        return res.json({ success: false, message: "OTP expired." });
    }

    if (stored.otp === otp) {
        return res.json({ success: true, message: "OTP Verified." });
    } else {
        return res.json({ success: false, message: "Invalid OTP." });
    }
});

app.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    // Verify again for security
    const stored = otpStore.get(email);
    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
        return res.json({ success: false, message: "Invalid or expired session. Please start over." });
    }

    try {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex === -1) {
            return res.json({ success: false, message: "User not found." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        users[userIndex].passwordHash = hashedPassword;

        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4));

        otpStore.delete(email); // Cleanup

        res.json({ success: true, message: "Password updated successfully." });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.json({ success: false, message: "Internal server error." });
    }
});

// --- LEAVE REQUEST SECTION ---
app.get('/leave', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    // Reuse the User Info injection logic for consistency
    const filePath = path.join(__dirname, 'views', 'leave.html');
    fs.readFile(filePath, 'utf8', (err, html) => {
        if (err) return res.status(500).send('Error loading page');

        const userInfoHtml = `
            <div class="user-info-display" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1); text-align: left;">
                <p style="margin: 0; color: #eec063; font-weight: 600; font-family: 'Poppins', sans-serif;">Logged in as:</p>
                <p style="margin: 5px 0 0; color: #fff; font-size: 1.1em;">${req.session.user.name}</p>
            </div>
        `;
        res.send(html.replace('<!-- USER_INFO_PLACEHOLDER -->', userInfoHtml));
    });
});

const nodemailer = require('nodemailer');

// ⚠️ CONFIGURE YOUR EMAIL HERE
// To make this work, you need a service like Gmail with "App Password" enabled, or an SMTP service like SendGrid/Outlook.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'teamspirezen@gmail.com',  // Replace with your personal gmail
        pass: 'mism jtei tygy wxsr'      // Replace with your App Password
    }
});

app.post('/leave', async (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('Unauthorized');
    }

    const { date, subject, message } = req.body;
    const user = req.session.user;

    const mailOptions = {
        from: user.email, // This sets the "From" header, but actual sender is the auth user above
        to: 'hr@spirezenenterprises.com', // The specific mail you mentioned
        subject: `LEAVE REQUEST: ${subject} - ${user.email}`,
        text: `
        Name: ${user.name} (${user.designation})
        Email: ${user.email}
        Date Requested: ${date}
        
        Message:
        ${message}
        `
    };

    try {
        await transporter.sendMail(mailOptions);

        // Return the standard success page with specific text
        const successPath = path.join(__dirname, 'views', 'success.html');
        fs.readFile(successPath, 'utf8', (err, html) => {
            if (err) return res.status(500).send("Error loading success page");

            const finalHtml = html
                .replace('<!-- TITLE_PLACEHOLDER -->', 'Request Sent!')
                .replace('<!-- MESSAGE_PLACEHOLDER -->', 'Your leave request has been successfully emailed to HR for review.');

            res.send(finalHtml);
        });

    } catch (error) {
        console.error("Email Error:", error);
        res.send("Error sending email: " + error.message);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
