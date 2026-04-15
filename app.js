const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError");

// ROUTES
const listingsRoutes = require("./routes/listing");
const reviewsRoutes = require("./routes/reviews");
const userRoutes = require("./routes/user");

// SESSION & AUTH
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local"); // ✅ FIXED NAME
const User = require("./models/user");

// =======================
// 🗄️ DB CONNECTION
// =======================
mongoose
  .connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

// =======================
// ⚙️ VIEW ENGINE
// =======================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// =======================
// 🔧 MIDDLEWARE
// =======================
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// =======================
// 🔐 SESSION CONFIG
// =======================
const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // ✅ FIXED
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// =======================
// 🔑 PASSPORT SETUP
// =======================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =======================
// 🌐 GLOBAL VARIABLES
// =======================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error"); // ✅ FIXED (no space)
  res.locals.currUser = req.user;
  next();
});

// =======================
// 🏠 HOME ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("Home Page");
});

// =======================
// 🚏 ROUTES
// =======================
app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/", userRoutes);

// =======================
// ❌ ERROR HANDLING
// =======================
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// =======================
// 🚀 SERVER
// =======================
app.listen(8080, () => {
  console.log("🚀 Server running on port 8080");
});
