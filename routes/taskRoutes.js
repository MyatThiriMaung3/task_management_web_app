const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const isAuthenticated = require('../middlewares/authMiddleware');

router.get('/dashboard', isAuthenticated, taskController.getDashboard);
router.get('/update-task/:taskId', isAuthenticated, taskController.getUpdateTaskPage);
router.post('/update-task/:taskId', isAuthenticated, taskController.handleUpdateTask);
router.get('/create-task', isAuthenticated, taskController.getCreateTaskPage);
router.post('/create-task', isAuthenticated, taskController.handleCreateTask);
router.delete('/delete-task/:taskId', isAuthenticated, taskController.handleDeleteTask);
router.get('/search-task', isAuthenticated, taskController.handleSearchTask);
router.post('/update-task-status', isAuthenticated, taskController.handleUpdateTaskStatus);

module.exports = router;