const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");

const ReviewControllers = require("../controllers/reviews.js");

// VALIDATION
const validateReview = (req, res, next) => {
  if (!req.body.review) {
    throw new ExpressError(400, "Invalid review data");
  }

  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }

  next();
};

// AUTH CHECK
const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }
  next();
};

// CREATE REVIEW
router.post(
  "/",
  validateReview,
  isLoggedIn,
  wrapAsync(ReviewControllers.reviewCreatePost),
);

// DELETE REVIEW
router.delete(
  "/:reviewId",
  isLoggedIn,
  wrapAsync(ReviewControllers.reviewDelete),
);

module.exports = router;
