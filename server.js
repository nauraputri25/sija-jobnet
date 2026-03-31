require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

const connectDB = require("./database/db");
const MongoStore = require("connect-mongo").default;

const auth = require("./middlewares/authMiddleware");

// controllers
const loginController = require("./controllers/loginController");
const lowonganController = require("./controllers/lowonganController");
const perusahaanController = require("./controllers/perusahaanController");
const siswaController = require("./controllers/siswaController");

const Lowongan = require("./models/lowonganModel");
const Siswa = require("./models/siswaModel");

const app = express();

// ================= DATABASE =================
connectDB();

// ================= VIEW =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));

// ================= SESSION =================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "stm-job-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/stmjob",
      collectionName: "sessions",
    }),
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// ================= STATIC =================
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ================= PUBLIC PAGE =================
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html")),
);

app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "login.html")),
);

app.get("/register", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "register.html")),
);

// ================= AUTH =================
app.post("/api/login", loginController.login);
app.post("/api/register", loginController.register);

// ================= LOWONGAN =================
app.get("/api/lowongan", lowonganController.getAllLowongan);
app.post("/api/lowongan", auth, lowonganController.createLowongan);
app.put("/api/lowongan/:id", auth, lowonganController.updateLowongan);
app.delete("/api/lowongan/:id", auth, lowonganController.deleteLowongan);

// ================= PERUSAHAAN =================
app.get("/api/perusahaan", perusahaanController.getAllPerusahaan);
app.post("/api/perusahaan", perusahaanController.createPerusahaan);

// ================= SISWA =================
app.get("/api/siswa", siswaController.getAllSiswa);
app.post("/api/siswa", siswaController.createSiswa);

// ================= LOGOUT =================
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.clearCookie("token");
  res.redirect("/login");
});

// ================= FORM DAFTAR =================
app.get("/form-daftar", async (req, res) => {
  try {
    const { id } = req.query;

    const loker = await Lowongan.findById(id).populate("perusahaan");

    if (!loker) {
      return res.status(404).send("Lowongan tidak ditemukan");
    }

    const user =
      req.user?.role === "siswa" ? await Siswa.findById(req.user.id) : null;

    res.render("dashboard/siswa/form_daftar", {
      user,
      loker,
      query: req.query,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal memuat form");
  }
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).send("404 Page Not Found");
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
