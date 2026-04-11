const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/reviews.js");
const session = require("express-session");

// DB CONNECTION
mongoose
  .connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("Connection Successful"))
  .catch((err) => console.log(err));

// VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOptions));

// ROUTES
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

// HOME
app.get("/", (req, res) => {
  res.send("Home Page");
});

// ERROR HANDLING
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// SERVER
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
