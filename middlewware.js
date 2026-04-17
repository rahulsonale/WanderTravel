const Listing = require("./models/listing");

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.saveRedirectUrl) {
    res.locals.redirectUrl = req.session.saveRedirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  let listing = await Listing.findById(id);
  if (!res.locals.currUser || !listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You dont have permission to edit");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
