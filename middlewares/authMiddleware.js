const jwt = require('jsonwebtoken');
const Siswa = require("../models/siswaModel");
const Perusahaan = require("../models/perusahaanModel");
const Admin = require("../models/adminModel");

module.exports = async (req, res, next) => {
    let token = (req.cookies && req.cookies.token) ? req.cookies.token : null;
    if (!token && req.headers['authorization']) {
        token = req.headers['authorization'].split(' ')[1];
    }

    if (!token) {
        req.user = null;
        if (req.originalUrl.startsWith("/admin") && req.originalUrl !== "/admin/verify") {
            return res.redirect("/login");
        }
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let userData;
        if (decoded.role === 'siswa') {
            userData = await Siswa.findById(decoded.id);
        } else if (decoded.role === 'perusahaan') {
            userData = await Perusahaan.findById(decoded.id);
            if (userData && userData.isVerified === false) {
        res.clearCookie("token");
        return res.redirect("/login?error=awaiting_verification");
        }
        } else if (decoded.role === 'admin') {
            userData = await Admin.findById(decoded.id);
        }

        if (userData) {
            req.user = userData.toObject();
            req.user.id = userData._id.toString(); 
            req.user.role = decoded.role;
        } else {
            req.user = null;
        }
        next();
    } catch (err) {
        res.clearCookie("token");
        req.user = null;
        if (req.originalUrl.startsWith("/admin")) {
            return res.redirect("/login");
        }
        next();
    }
};