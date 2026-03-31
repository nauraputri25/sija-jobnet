const jwt = require("jsonwebtoken");
// Ganti '../models/siswaModel' dengan path model User/Siswa kamu yang benar
const User = require("../models/siswaModel");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. CARI USER DI DATABASE BERDASARKAN EMAIL
    const user = await User.findOne({ email });

    // 2. CEK JIKA USER TIDAK ADA
    if (!user) {
      return res.render("login", { error: "Email atau Password salah" });
    }

    // 3. CEK VERIFIKASI PERUSAHAAN (Logika kamu yang tadi)
    if (user.role === "perusahaan" && user.isVerified === false) {
      return res.render("login", {
        error: "Akun perusahaan anda sedang menunggu verifikasi admin",
      });
    }

    // 4. BUAT TOKEN (Sekarang variabel 'user' sudah ada isinya)
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        isVerified: user.isVerified,
        name: user.name,
      },
      process.env.JWT_SECRET || "12345678",
      { expiresIn: "1d" },
    );

    // 5. SIMPAN KE COOKIE ATAU KIRIM RESPONSE
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.render("login", { error: "Terjadi kesalahan pada server" });
  }
};
