module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.saveRedirectUrl) {
    res.locals.redirectUrl = req.session.saveRedirectUrl;
  }
  next();
};
