const router = require("express").Router();
const Admin = require("../models/admin.model");
const Group = require("../models/group.model");
const Elector = require("../models/elector.model");
const requireAuth = require("../middlewares/requireAuth");

// Get login-admin page
router.get("/", requireAuth, async (req, res) => {
  try {
    const groupsCount = await Group.countDocuments({});
    const electorsCount = await Elector.countDocuments({});
    const electedCount = await Elector.countDocuments({ isElected: true });
    const adminsCount = await Admin.countDocuments({ isSuperAdmin: false });

    if (req.session.admin.isSuperAdmin) {
      res.render("superAdmin/dashboard", {
        groupsCount,
        electorsCount,
        electedCount,
        adminsCount,
        isSuperAdmin: req.session.admin.isSuperAdmin,
      });
    } else {
      res.render("index", {
        groupsCount,
        electorsCount,
        isSuperAdmin: req.session.admin.isSuperAdmin,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get login-admin page
router.get("/login", (req, res) => {
  if (req.session.admin) {
    res.redirect("/");
  } else {
    res.render("login");
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin || admin.password != password) {
      res.send("Invalid username or password");
      return;
    } else {
      // Store user information in session
      req.session.admin = admin;
      res.redirect("/");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destruction error:", err);
    }
    res.redirect("/");
  });
});

module.exports = router;
