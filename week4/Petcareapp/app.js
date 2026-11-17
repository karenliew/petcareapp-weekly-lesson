// Pet Care Journal System
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const PORT = 3005;
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error('SESSION_SECRET environment variable must be set');
}

// View Engine and Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true
}));

app.use(flash());
app.use(express.json());


// Routes
app.use(require('./routes/indexRoutes'));
app.use(require('./routes/authRoutes'));
app.use(require('./routes/adminRoutes'));
app.use(require('./routes/petRoutes'));
app.use(require('./routes/journalRoutes'));
app.use(require('./routes/serviceRoutes'));
app.use(require('./routes/bookingRoutes'));
app.use(require('./routes/paymentRoutes'));

// =========================
// Start Server
// =========================
app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));
