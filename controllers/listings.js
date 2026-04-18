const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/newForm");
};

module.exports.showListings = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

module.exports.editListings = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/edit", { listing });
};

module.exports.updateListings = async (req, res) => {
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
};

module.exports.deleteListings = async (req, res) => {
  const { id } = req.params;

  const deletedListing = await Listing.findByIdAndDelete(id);

  if (!deletedListing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

module.exports.createListings = async (req, res) => {
  let data = req.body.listing;

  const newListing = new Listing(data);
  newListing.owner = req.user._id;

  newListing.image = {
    url: req.file.path,
    filename: req.file.filename,
  };

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};
