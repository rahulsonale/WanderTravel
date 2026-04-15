const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

const Listing = require("../models/listing");
const { listingSchema, reviewSchema } = require("../schema");

// =======================
// 🔐 AUTH MIDDLEWARE
// =======================
const isLoggedIn = (req, res, next) => {
  console.log(req.user);

  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }
  next();
};

// =======================
// ✅ VALIDATION
// =======================
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

const validateReview = (req, res, next) => {
  if (!req.body.review) {
    throw new ExpressError("Invalid review data", 400);
  }

  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errMsg, 400);
  }
  next();
};

// =======================
// 📌 INDEX
// =======================
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  }),
);

// =======================
// ➕ NEW (FORM)
// =======================
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/newForm"); // make sure this file exists
});

// =======================
// 🆕 CREATE
// =======================
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    let data = req.body.listing;

    // Fix image structure
    data.image = {
      url: data.image,
      filename: "listingimage",
    };

    const newListing = new Listing(data);
    newListing.owner = req.user._id;
    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  }),
);

// =======================
// 🔍 SHOW
// =======================
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
  }),
);

// =======================
// ✏️ EDIT
// =======================
router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    res.render("listings/edit", { listing });
  }),
);

// =======================
// 🔄 UPDATE
// =======================
router.put(
  "/:id",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    let data = req.body.listing;

    // Handle image update safely
    if (data.image && data.image.trim() !== "") {
      data.image = {
        url: data.image,
        filename: "listingimage",
      };
    } else {
      delete data.image;
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedListing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  }),
);

// =======================
// ❌ DELETE
// =======================
router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  }),
);

module.exports = router;
