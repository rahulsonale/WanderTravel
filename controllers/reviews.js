const Review = require("../models/review");
const Listing = require("../models/listing");

// CREATE REVIEW
module.exports.reviewCreatePost = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  await newReview.save();

  listing.reviews.push(newReview._id);
  await listing.save();

  req.flash("success", "New Review Created!");
  res.redirect(`/listings/${id}`);
};

// DELETE REVIEW
module.exports.reviewDelete = async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
};
