const Task = require('../models/taskModel');

exports.getDashboard = async (req, res) => {
    try {
        const username = req.session.loggedInUser.username;

        // Fetch tasks in parallel using Promise.all
        const [taskDefault, taskOngoing, taskFinished] = await Promise.all([
            Task.findTasksByUsernameAndStatus(username, "default"),
            Task.findTasksByUsernameAndStatus(username, "on-going"),
            Task.findTasksByUsernameAndStatus(username, "finished")
        ]);

        res.render("dashboard", {
            activePage: "dashboard",
            taskDefault,
            taskOngoing,
            taskFinished
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { title: "Database error", status: "500", message: err });
    }
};

exports.getUpdateTaskPage = (req, res) => {
    const taskId = req.params.taskId;

    Task.findTasksByTaskId(taskId, (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).render('error', { title: "Database error", status: "500", message: err });
        }

        if (results.length === 0) return res.status(500).render('error', { title: "Task Not Found", status: "404", message: "Task not found" });

        res.render("task-edit", { task: results[0] });
    });
};

exports.handleUpdateTask = (req, res) => {
    const taskId = req.params.taskId;
    const { task_title, task_description, task_status, task_priority } = req.body;

    Task.updateTask(taskId, task_title, task_description, task_status, task_priority, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).render('error', { title: "Database error", status: "500", message: err });
        }

        res.redirect("/tasks/dashboard");
    });
};

exports.getCreateTaskPage = (req, res) => {
    res.render("task-create");
};

exports.handleCreateTask = (req, res) => {
    const { task_title, task_description, task_priority } = req.body;
    const username = req.session.loggedInUser.username;

    Task.createTask(task_title, task_description, 'default', task_priority, username, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).render('error', { title: "Database error", status: "500", message: err });
        }

        res.redirect("/tasks/dashboard");
    });
};

exports.handleDeleteTask = (req, res) => {
    const taskId = req.params.taskId;

    Task.deleteTask(taskId, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).render('error', { title: "Database error", status: "500", message: err });
        }

        if (results.length === 0) {
            return res.status(500).render('error', { title: "Task Not Fount", status: "404", message: "Task not found" });
        }

        res.json({ success: true });
    })
};

exports.handleSearchTask = (req, res) => {
    const query = req.query.query;
    const username = req.session.loggedInUser.username;

    if (!query) {
        return res.render("search-result", { tasks: []})
    }

    Task.findTaskByWords(username, `%${query}%`, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).render('error', { title: "Database error", status: "500", message: err });
        }

        res.render("search-result", { tasks: results });
    });
};

exports.handleUpdateTaskStatus = (req, res) => {
    const { taskId, newStatus } = req.body;
    const username = req.session.loggedInUser.username;

    Task.updateTaskStatus(taskId, newStatus, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).render('error', { title: "Database error", status: "500", message: err });
        }

        res.json({ success: true, message: "Task status updated successfully"});
    })
};