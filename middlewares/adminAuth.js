module.exports = function (req, res, next) {
  if (!req.session.adminVerified) {
    return res.redirect("/admin/verify");
  }
  next();
};
