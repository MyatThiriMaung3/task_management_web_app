const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get(['/', '/login'], authController.getLoginPage);
router.post('/login', authController.handleLogin);
router.get('/signup', authController.getSignupPage);
router.post('/signup', authController.handleSignup);
router.get('/generate-username', authController.handleGenerateUsername);
router.get('/logout', authController.handleLogout);

module.exports = router;