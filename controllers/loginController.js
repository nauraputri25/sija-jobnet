const token = jwt.sign(
    { 
      id: user._id, 
      role: user.role, 
      isVerified: user.isVerified, 
      name: user.name 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1d' }
);

if (user.role === "perusahaan" && user.isVerified === false) {
   return res.render("login", {
      error: "Akun perusahaan anda sedang menunggu verifikasi admin"
   });
}