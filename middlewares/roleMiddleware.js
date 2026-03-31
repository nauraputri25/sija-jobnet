module.exports = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send("Akses ditolak");
    }
    
    // Jika dia perusahaan, cek apakah sudah diverifikasi
    if (req.user.role === 'perusahaan' && req.user.isVerified === false) {
      return res.send("<h1>Akun Anda sedang menunggu verifikasi Admin.</h1>");
    }
    next();
  };
};