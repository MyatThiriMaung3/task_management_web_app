const multer = require("multer");
const path = require("path");

// Multer configuration
const storage = multer.diskStorage({
    destination: "./public/images/",  // Save files in public/images
    filename: function (req, file, cb) {
        cb(null, "profile_" + Date.now() + path.extname(file.originalname));
    }
});

// Multer upload middleware
const upload = multer({ storage: storage });

module.exports = upload;