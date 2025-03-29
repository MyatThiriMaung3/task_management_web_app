const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const isAuthenticated = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', isAuthenticated, profileController.getProfilePage);
router.post('/update-profile', isAuthenticated, upload.single('profileImage'), profileController.handleUpdateProfile);
router.post('/update-user', isAuthenticated, profileController.handleUpdateUser);

module.exports = router;