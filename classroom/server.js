const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionOptions = {
  secret: "mysupersecretstring",
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOptions));
app.use(flash());

app.get("/register", (req, res) => {
  let { name = "Alex" } = req.query; //default value
  req.session.name = name;
  if (name === "Alex") {
    req.flash("error", "user not registered");
  } else {
    req.flash("success", "user registered successfully!");
  }

  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  //res.send(`hello ${req.session.name}`);

  res.render("page.ejs", { name: req.session.name });
});

app.listen(3000, () => {
  console.log("server is listening to port 3000");
});
