const db = require('../config/db');

exports.findTasksByUser = (username, callback) => {
    db.query("SELECT * FROM tasks WHERE username = ?", 
        [username], 
        callback
    );
};

exports.findTasksByTaskId = (taskId, callback) => {
    db.query("SELECT * FROM tasks WHERE task_id = ?",
        [taskId], 
        callback
    );
};

exports.findTasksByUsernameAndStatus = (username, status) => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM tasks WHERE username = ? AND task_status = ?", 
            [username, status], 
            (err, results) => {
                if (err) reject(err);
                else resolve(results);
            }
        );
    });
};

exports.createTask = (task_title, task_description, task_status, task_priority, username, callback) => {
    db.query("INSERT INTO tasks (task_title, task_description, task_status, task_priority, username) VALUES (?, ?, ?, ?, ?)",
        [task_title, task_description, task_status, task_priority, username],
        callback
    );
};

exports.updateTask = (taskId, task_title, task_description, task_status, task_priority, callback) => {
    db.query("UPDATE tasks SET task_title = ?, task_description = ?, task_status = ?, task_priority = ? WHERE task_id = ?",
        [task_title, task_description, task_status, task_priority, taskId],
        callback
    );
};

exports.deleteTask = (taskId, callback) => {
    db.query("DELETE FROM tasks WHERE task_id = ?", 
        [taskId], 
        callback
    );
};

exports.findTaskByWords = (username, keyword, callback) => {
    db.query("SELECT * FROM tasks WHERE username = ? AND (task_title LIKE ? OR task_description LIKE ?) ORDER BY created_at DESC",
        [username, keyword, keyword], 
        callback
    );
};

exports.updateTaskStatus = (taskId, status, callback) => {
    db.query("UPDATE tasks SET task_status = ? WHERE task_id = ?",
        [status, taskId], 
        callback
    );
};

exports.getTotalTasks = (username) => {
    return new Promise((resolve, reject) => {
        db.query("SELECT COUNT(*) AS total FROM tasks WHERE username = ?", [username], (err, results) => {
            if (err) reject(err);
            else resolve(results[0].total);
        });
    });
};

exports.getTotalTasksByStatus = (username, status) => {
    return new Promise((resolve, reject) => {
        db.query("SELECT COUNT(*) AS total FROM tasks WHERE username = ? AND task_status = ?", [username, status], (err, results) => {
            if (err) reject(err);
            else resolve(results[0].total);
        });
    });
};

exports.getTotalTasksByAllStatus = (username, status = null) => {
    return new Promise((resolve, reject) => {
        let query;
        let params;

        if (status) {
            query = "SELECT COUNT(*) AS total FROM tasks WHERE username = ? AND task_status = ?";
            params = [username, status];
        } else {
            query = "SELECT task_status, COUNT(*) AS count FROM tasks WHERE username = ? GROUP BY task_status";
            params = [username];
        }

        db.query(query, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

exports.getTaskHistory = (username) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT DATE(created_at) AS task_date,
                SUM(task_status = 'default') AS default_count,
                SUM(task_status = 'on-going') AS ongoing_count,
                SUM(task_status = 'finished') AS finished_count
            FROM tasks
            WHERE username = ?
            GROUP BY task_date
            ORDER BY task_date ASC`,
            [username],
            (err, results) => {
                if (err) reject(err);
                else resolve(results);
            }
        );
    });
};