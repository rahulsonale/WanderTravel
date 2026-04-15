const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

// VALIDATION
const validateListing = (req, res, next) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Invalid listing data");
  }

  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};
const validateReview = (req, res, next) => {
  if (!req.body.review) {
    throw new ExpressError(400, "Invalid review data");
  }

  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// INDEX
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }),
);

// NEW
router.get("/new", (req, res) => {
  res.render("listings/newForm.ejs");
});

// CREATE
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res) => {
    let data = req.body.listing;

    data.image = {
      url: data.image,
      filename: "listingimage",
    };

    const newListing = new Listing(data);
    await newListing.save();
    req.flash("success", "New Listing Created!");

    res.redirect("/listings");
  }),
);

// SHOW
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      req.flash("error", "Listing you requested does not exists");
      res.redirect("/listings");
    }

    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/show.ejs", { listing });
  }),
);

// EDIT
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing you requested does not exists");
      res.redirect("/listings");
    } 

    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/edit.ejs", { listing });
  }),
);

// UPDATE
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let data = req.body.listing;

    if (data.image && data.image.trim() !== "") {
      data.image = {
        url: data.image,
        filename: "listingimage",
      };
    } else {
      delete data.image;
    }

    await Listing.findByIdAndUpdate(id, data);
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  }),
);

// DELETE
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  }),
);

module.exports = router;
