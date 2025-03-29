const Task = require('../models/taskModel');

exports.getAnalysisPage = async (req, res) => {
    try {
        const username = req.session.loggedInUser.username;

        // Execute database queries
        const [totalTasks, defaultTasks, ongoingTasks, finishedTasks] = await Promise.all([
            Task.getTotalTasks(username),
            Task.getTotalTasksByStatus(username, 'default'),
            Task.getTotalTasksByStatus(username, 'on-going'),
            Task.getTotalTasksByStatus(username, 'finished')
        ]);

        // Render the view with retrieved data
        res.render("analysis", {
            activePage: "analysis",
            totalTasks,
            defaultTasks,
            ongoingTasks,
            finishedTasks
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database connection error" });
    }
};

exports.getChartData = async (req, res) => {
    try {
        const username = req.session.loggedInUser.username;

        // Execute database queries
        const [totalTasks, taskCounts, taskHistory] = await Promise.all([
            Task.getTotalTasks(username),
            Task.getTotalTasksByAllStatus(username),
            Task.getTaskHistory(username)
        ]);

        // Organize task counts by status
        let statusCounts = { default: 0, "on-going": 0, finished: 0 };
        taskCounts.forEach(row => {
            statusCounts[row.task_status] = row.count;
        });

        // Send JSON response
        res.json({
            totalTasks,
            statusCounts,
            taskHistory
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database connection error" });
    }
};