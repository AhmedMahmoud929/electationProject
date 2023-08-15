const router = require("express").Router();
const Elector = require("../models/elector.model");
const Group = require("../models/group.model");
const fs = require("fs");
const xss = require("xss"); // To prevent XSS vulnerability
const csvParser = require("csv-parser");
const csv = require("csvtojson");

// Configure multer for file upload
const multer = require("multer");
// let storage = multer.memoryStorage();
let storage = multer.diskStorage({ destination: "/tmp/upload" });
let upload = multer({ storage: storage });

// GET create-elector page
router.get("/create-elector", async (req, res) => {
  try {
    const groups = await Group.find();
    res.render("elector/create-elector", {
      groups,
      isSuperAdmin: req.session.admin.isSuperAdmin,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).send("Internal Server Error");
  }
});

// GET all electros
router.get("/all-electors", async (req, res) => {
  try {
    const groups = await Group.find();
    const onlyElected = Boolean(req.query.onlyElected);
    let filter = {};
    if (onlyElected == true) filter.isElected = true;
    const allElectors = await Elector.find(filter);
    // console.log(allElectors);
    res.render("elector/all-electors", {
      allElectors,
      onlyElected,
      groups,
      isSuperAdmin: req.session.admin.isSuperAdmin,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).send("Internal Server Error");
  }
});

// POST a new elector
router.post("/create-elector", async (req, res) => {
  try {
    const { NID, fullName, job, phone, electionPlace, isElected, groupId } =
      req.body;

    const group = await Group.findById(groupId);
    const NID_Exist = await Elector.findOne({ NID });
    console.log(NID_Exist);
    if (!group) {
      req.flash("error", "Group not found.");
      res.redirect("/create-elector");
    } else if (NID_Exist) {
      req.flash("error", "NID is already exist.");
      res.redirect("/create-elector");
    } else {
      const newElector = await Elector.create({
        NID,
        fullName,
        job,
        phone,
        electionPlace,
        isElected: !!isElected,
        group: groupId,
      });
      group.electors.push(newElector);
      await group.save();

      req.flash("success", "Elector added successfully.");
      res.redirect("/create-elector");
    }
  } catch (error) {
    console.error("Error creating elector:", error);
    res.status(500).send("Internal Server Error");
  }
});

// EDIT an exist elector
router.post("/edit-elector/:electorId", async (req, res) => {
  try {
    const electorId = req.params.electorId;
    const { NID, fullName, job, phone, isElected, electionPlace } = req.body;

    const updatedFields = {};

    // Check if data want to be updated
    if (NID) updatedFields.NID = NID;
    if (fullName) updatedFields.fullName = fullName;
    if (job) updatedFields.job = job;
    if (phone) updatedFields.phone = phone;
    if (isElected !== undefined) updatedFields.isElected = !!isElected;
    if (electionPlace) updatedFields.electionPlace = electionPlace;

    // update the elector
    const updatedElector = await Elector.findByIdAndUpdate(
      electorId,
      updatedFields,
      { new: true } // Return the updated document
    );

    console.log("Elector updated:", updatedElector);
    res.redirect("/view-group/" + updatedElector.group); // Redirect to the group's details page
  } catch (error) {
    console.error("Error updating elector:", error);
    res.status(500).send("Internal Server Error");
  }
});

// TOGGLE the isElected
router.post("/toggle-is-elected/:electorId", async (req, res) => {
  try {
    const electorId = req.params.electorId;
    const elector = await Elector.findById(electorId);

    if (!elector) {
      return res.status(404).send("Elector not found");
    }

    elector.isElected = !elector.isElected;
    await elector.save();

    res.redirect("back"); // Redirect back to the same page
  } catch (error) {
    console.error("Error toggling isElected:", error);
    res.status(500).send("Internal Server Error");
  }
});

// DELETE an existing elector
router.post("/delete-elector/:electorId", async (req, res) => {
  try {
    const electorId = req.params.electorId;
    const groupId = req.body.groupId;

    // Find and delete the elector
    const deletedElector = await Elector.findByIdAndDelete(electorId);

    if (!deletedElector) {
      return res.status(404).send("Elector not found");
    }

    // Remove the elector's ID from the Group model
    await Group.findByIdAndUpdate(groupId, { $pull: { electors: electorId } });

    res.redirect("/view-group/" + groupId);
  } catch (error) {
    console.error("Error deleting elector:", error);
    res.status(500).send("Internal Server Error");
  }
});

// SEARCH for electors in
router.get("/search-elector", async (req, res) => {
  try {
    const searchValue = xss(req.query.searchValue).toLowerCase();
    const searchWay = req.query.searchWay; // "Search By Name" or "Search By NID"
    const groupId = req.query.groupId; // Group ObjectID or false

    let group = undefined;
    let filter = {};

    // If groupId is provided, try to find the group
    if (groupId) {
      group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).send("Group not found");
      } else filter.group = groupId;
    }

    // console.log("ID : ", groupId);
    // console.log("Group : ", group);
    console.log("Filter : ", filter);

    // Get required electors
    const allElectors = await Elector.find(filter);
    const allGroups = await Group.find({});

    // Search By Name
    if (searchWay === "Search By Name") {
      const electors = allElectors.filter((ele) =>
        ele.fullName.toLowerCase().includes(searchValue)
      );
      res.render("elector/search-elector", {
        allGroups,
        group,
        referrer: new URL(req.get("Referrer")).pathname.slice(1),
        searchValue,
        electors,
        isSuperAdmin: req.session.admin.isSuperAdmin,
      });
    }

    // Search By NID
    if (searchWay === "Search By NID") {
      const elector = allElectors.filter((ele) => ele.NID === searchValue);
      console.log(elector);
      res.render("elector/view-elector", {
        elector: elector[0],
        allGroups,
        referrer: new URL(req.get("Referrer")).pathname.slice(1),
        isSuperAdmin: req.session.admin.isSuperAdmin,
      });
    }
  } catch (error) {
    console.error("Error searching for electors:", error);
    res.status(500).send("Internal Server Error");
  }
});

// GET view-elector page
router.get("/view-elector/:electorId", async (req, res) => {
  try {
    const electorId = req.params.electorId;
    const elector = await Elector.findById(electorId);

    if (!elector) {
      return res.status(404).send("Elector not found");
    }

    res.render("elector/view-elector", {
      elector,
      referrer: new URL(req.get("Referrer")).pathname.slice(1),
      isSuperAdmin: req.session.admin.isSuperAdmin,
    });
  } catch (error) {
    console.error("Error fetching elector:", error);
    res.status(500).send("Internal Server Error");
  }
});

// GET upload-electors page
router.get("/upload-electors", async (req, res) => {
  try {
    res.render("elector/upload-electors", {
      isSuperAdmin: req.session.admin.isSuperAdmin,
    });
  } catch (error) {
    console.error("Error get page:", error);
    res.status(500).send("Internal Server Error");
  }
});

// UPLOAD csv file and store it
router.post("/upload-electors", upload.single("file"), async (req, res) => {
  try {
    const csvData = await csv().fromFile(req.file.path);
    let failedRows = [];
    let failedCount = 0;
    // Create an array to store all the promises
    const promises = csvData.map(async (row, ix) => {
      try {
        const { NID, fullName, job, phone, electionPlace, isElected, group } =
          row;

        const Group_Exist = await Group.findOne({ name: group });
        const NID_Exist = await Elector.findOne({ NID });

        if (
          Group_Exist &&
          !NID_Exist &&
          fullName &&
          job &&
          phone &&
          electionPlace &&
          Object.keys(row).length === 7
        ) {
          const newElector = await new Elector({
            NID,
            fullName,
            job,
            phone,
            electionPlace,
            isElected,
            group: Group_Exist._id,
          }).save();

          Group_Exist.electors.push(newElector);
          await Group_Exist.save();
        } else {
          row.line = ix + 1;
          failedRows.push(row);
          failedCount++;
        }
      } catch (err) {
        console.log("Fetching rows error", err);
      }
    });

    // This code will run after all the promises have resolved
    Promise.all(promises)
      .then(() => {
        res.render("elector/upload-feedback", {
          failedCount,
          failedRows,
          allCount: csvData.length,
          isSuperAdmin: req.session.admin.isSuperAdmin,
        });
      })
      .catch((err) => {
        console.error("Promise error:", err);
      });
  } catch (err) {}
});

// EXPORT electors
router.get("/export-electors", async (req, res) => {
  try {
    const groups = await Group.find({});
    const filterQuery = {}; // Initialize an empty filter query

    // Check if filter parameters are provided in the request query
    if (req.query.isElected !== undefined) {
      filterQuery.isElected = req.query.isElected === "true";
    }
    if (req.query.group !== undefined) {
      filterQuery.group = groups.find(
        (grp) => String(grp.name) === String(req.query.group)
      )._id;
    }

    const electors = await Elector.find(filterQuery);

    const csvHeader = "NID,fullName,job,phone,electionPlace,isElected,group\n";
    const csvRows = electors
      .map(
        (elector) =>
          `${elector.NID},"${elector.fullName}","${elector.job}","${
            elector.phone
          }","${elector.electionPlace}",${elector.isElected},${
            groups.find((grp) => String(grp._id) === String(elector.group)).name
          }`
      )
      .join("\n");

    const csvContent = csvHeader + csvRows;

    fs.writeFileSync("exported_electors.csv", csvContent);

    res.download("exported_electors.csv", "exported_electors.csv"); // Download the exported CSV file
  } catch (err) {
    console.log("Export error ", err);
    res.send("Export ERROR");
  }
});

module.exports = router;
