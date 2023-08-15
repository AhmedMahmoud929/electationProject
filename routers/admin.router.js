const router = require("express").Router();
const Admin = require("../models/admin.model");
const requireAuth = require("../middlewares/requireAuth");
const requireSuper = require("../middlewares/requireSuper");

// Get all Admin
router.get("/admin-list", requireAuth, requireSuper, async (req, res) => {
  try {
    const admins = await Admin.find({ isSuperAdmin: false });
    res.render("superAdmin/admin-list", {
      admins,
      isSuperAdmin: req.session.admin.isSuperAdmin,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get create-admin page
router.get("/create-admin", requireAuth, requireSuper, (req, res) => {
  res.render("superAdmin/create-admin", {
    isSuperAdmin: req.session.admin.isSuperAdmin,
  });
});

// Create a new admin
router.post("/create-admin", requireAuth, requireSuper, async (req, res) => {
  try {
    const { fullName, username, password } = req.body;
    console.log(username);
    // craete new user
    const newAdmin = new Admin({
      fullName,
      username,
      password, // You want to hash the password before storing it
      isAdmin: true,
      isSuperAdmin: false,
    });
    // save the new user
    await newAdmin.save();
    res.redirect("/admin-list");
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete an admin
router.post("/delete-admin", requireAuth, requireSuper, async (req, res) => {
  const adminId = req.body.adminId;
  await Admin.findByIdAndDelete(adminId);
  res.redirect("/admin-list");
});

module.exports = router;
