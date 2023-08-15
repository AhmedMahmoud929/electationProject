module.exports = (req, res, next) => {
  if (req.session.admin.isSuperAdmin) {
    next();
  } else {
    res.redirect("/");
  }
};
