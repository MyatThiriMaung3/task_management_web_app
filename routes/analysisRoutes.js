const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const isAuthenticated = require('../middlewares/authMiddleware');

router.get('/', isAuthenticated, analysisController.getAnalysisPage);
router.get('/chart-data', isAuthenticated, analysisController.getChartData);

module.exports = router;