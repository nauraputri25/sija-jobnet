const jwt = require("jsonwebtoken");
const User = require("../models/siswaModel"); // Pastikan path model ini benar

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cari user di database berdasarkan email
    const user = await User.findOne({ email });

    // 2. Jika user tidak ditemukan
    if (!user) {
      return res.render("login", { error: "Email atau Password salah" });
    }

    // 3. Cek verifikasi jika role-nya perusahaan
    if (user.role === "perusahaan" && user.isVerified === false) {
      return res.render("login", {
        error: "Akun perusahaan anda sedang menunggu verifikasi admin",
      });
    }

    // 4. BUAT TOKEN (Sekarang variabel 'user' sudah aman karena di dalam fungsi)
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

    // 5. Simpan token di cookie dan pindah ke dashboard
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error Login:", error);
    res.status(500).render("login", { error: "Terjadi kesalahan pada server" });
  }
};
