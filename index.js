const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const port = process.env.PORT || 2611;
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("express-flash");
const SessionStore = require("connect-mongodb-session")(session);

const DB_URL =
  "mongodb+srv://ahmedMahmoud:ahmedMahmoud@cluster0.u22xrj7.mongodb.net/ElectionProject?retryWrites=true&w=majority";

// Routers
const authRouter = require("./routers/auth.router");
const adminRouter = require("./routers/admin.router");
const groupRouter = require("./routers/group.router");
const electorRouter = require("./routers/elector.router");

// Connect to MongoDB
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Store sessions
const STORE = new SessionStore({
  uri: DB_URL,
  collection: "loginSessions",
});

app.use(
  session({
    secret: "3MyS#ecr$2xtDLa01DwqT",
    saveUninitialized: false,
    store: STORE,
    cookie: {
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    },
  })
);

// Flash Sessions
app.use(flash());

// Body-Parser middleware
app.use(bodyParser.urlencoded({ extended: true }));


// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Set static path
app.use(express.static(path.join(__dirname, "assets")));

// Routes
app.use("/", authRouter);
app.use("/", adminRouter);
app.use("/", groupRouter);
app.use("/", electorRouter);

// Server Listening
app.listen(port, () => {
  console.log(`http://127.0.0.1:${port}`);
});
