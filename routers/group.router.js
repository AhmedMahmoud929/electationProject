const router = require("express").Router();
const Group = require("../models/group.model");
const Elector = require("../models/elector.model");
const requireAuth = require("../middlewares/requireAuth");

// GET create-group page
router.get("/create-group", requireAuth, (req, res) => {
  res.render("group/create-group", {
    isSuperAdmin: req.session.admin.isSuperAdmin,
  });
});

// POST a new group
router.post("/create-group", requireAuth, async (req, res) => {
  try {
    const name = req.body.name;
    const newGroup = new Group({ name });
    await newGroup.save();
    res.redirect("/group-list");
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).send("Internal Server Error");
  }
});

// GET group-list page
router.get("/group-list", requireAuth, async (req, res) => {
  try {
    const groups = await Group.find({});
    res.render("group/group-list", {
      groups,
      isSuperAdmin: req.session.admin.isSuperAdmin,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).send("Internal Server Error");
  }
});

// GET view-group page
router.get("/view-group/:groupId", requireAuth, async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId).populate("electors");

    // Get the
    if (!group) {
      return res.status(404).send("Group not found");
    } else {
      const onlyElected = Boolean(req.query.onlyElected);
      let electors = group.electors;
      if (onlyElected == true) {
        electors = electors.filter((ele) => ele.isElected === true);
      }
      res.render("group/view-group", {
        group,
        electors,
        onlyElected,
        isSuperAdmin: req.session.admin.isSuperAdmin,
      });
    }
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).send("Internal Server Error");
  }
});

// DELETE a group
router.post("/delete-group", requireAuth, async (req, res) => {
  try {
    const groupId = req.body.groupId;
    console.log(groupId);
    const group = await Group.findByIdAndDelete(groupId);
    for (const electorId of group.electors) {
      await Elector.findByIdAndDelete(electorId);
    }
    res.redirect("/group-list");
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
