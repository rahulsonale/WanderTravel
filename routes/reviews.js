const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");

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

// CREATE REVIEW
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    let newReview = new Review(req.body.review);

    await newReview.save();

    listing.reviews.push(newReview._id);
    await listing.save();

    res.redirect(`/listings/${id}`);
  }),
);

//Delete review route
// DELETE REVIEW (using $pull operator)

router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // remove review reference from listing
    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  }),
);

module.exports = router;
