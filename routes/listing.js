const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema");
const { isOwner } = require("../middlewware");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });
const listingControllers = require("../controllers/listings");

// AUTH MIDDLEWARE
const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }
  next();
};

// VALIDATION
const validateListing = (req, res, next) => {
  if (!req.body.listing) {
    throw new ExpressError("Invalid listing data", 400);
  }

  const { error } = listingSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errMsg, 400);
  }

  next();
};

// INDEX + CREATE
router
  .route("/")
  .get(wrapAsync(listingControllers.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingControllers.createListings),
  );

// IMPORTANT: place /new BEFORE /:id
router.get("/new", isLoggedIn, listingControllers.renderNewForm);

// SHOW + UPDATE
router
  .route("/:id")
  .get(wrapAsync(listingControllers.showListings))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingControllers.updateListings),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingControllers.deleteListings));

// EDIT
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.renderEditForm),
);

module.exports = router;
