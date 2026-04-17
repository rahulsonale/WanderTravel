const User = require("../models/user.js");

// RENDER SIGNUP
module.exports.renderSignup = (req, res) => {
  res.render("users/signup.ejs");
};

// SIGNUP LOGIC
module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);

      req.flash("success", "Welcome to WanderTravel");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// RENDER LOGIN
module.exports.renderLogin = (req, res) => {
  res.render("users/login.ejs");
};

// LOGIN SUCCESS
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to WanderTravel, you are logged in!");

  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// LOGOUT
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};
