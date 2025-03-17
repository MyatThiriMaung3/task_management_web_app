const { error } = require('console')
require('dotenv').config()
const express = require('express')
const path = require('path')
const session = require('express-session')
const multer = require('multer')
const app = express()
const cors = require('cors')
const db = require('./db')
const { resolve } = require('path/posix')
const { rejects } = require('assert')
const { finished } = require('stream')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, 'public')))

const storage = multer.diskStorage({
    destination: "./public/images/",
    filename: function (req, file, cb) {
        cb(null, "profile_" + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

app.use(session({
    secret: 'SECRET_KEY_TO_STORE_IN_ENV_FILE_MAYBE',
    resave: false,
    saveUninitialized: false
}))

app.use((req, res, next) => {
    res.locals.loggedInUser = req.session.loggedInUser || null
    next()
})


function isAuthenticated(req, res, next) {
    if (req.session.loggedInUser) {
        next()
    } else {
        res.render("login", {error: "You need to login to access pages of the website"})
    }
}

app.get("/generate-username", isAuthenticated, async (req, res) => {
    let username;
    let isUnique = false

    while (!isUnique) {
        username = "user" + Math.floor(Math.random() * 1000)

        const query = "SELECT * FROM users WHERE username = ?";
        db.query(query, [username], (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Database error"})
            }

            if (results.length === 0) {
                isUnique = true
                res.json({username})
            }
        })
    }
})

app.post("/update-profile", isAuthenticated, upload.single("profileImage"), (req, res) => {
    const username = req.session.loggedInUser.username
    const profileImage = "/images/" + req.file.filename

    db.query("UPDATE users SET user_profile = ? WHERE username = ?", [profileImage, username], (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: "Database connection error"})
        }

        req.session.loggedInUser.profile = profileImage
        res.redirect("/profile")
    })
})

app.post("/update-user", isAuthenticated, (req, res) => {
    const { newUsername, currentPassword, newPassword, confirmedPassword, changePassword } = req.body
    const username = req.session.loggedInUser.username

    if (!currentPassword) {
        console.log("Please enter your current password to make changes")
        return res.json({ success: false, message: "Please enter your current password to make changes"})
    }

    if (!newUsername) {
        console.log("Please enter new username or leave it as it is. You can't leave it empty")
        return res.json({ success: false, message: "Please enter new username or leave it as it is. You can't leave it empty"})
    }

    db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: "Database connection error"})
        }

        if (results.length === 0) {
            console.log("User not found")
            return res.json({ success: false, message: "User not found"})
        }

        const user = results[0]

        if (user.user_password !== currentPassword) {
            console.log("Invalid Password")
            return res.json({ success: false, message: "Invalid Password"})
        }

        let updateFields = []
        let updateValues = []

        if (newUsername !== username) {
            updateFields.push("username = ?")
            updateValues.push(newUsername)
        }

        if (changePassword === true) {
            if (!newPassword || !confirmedPassword) {
                console.log("Please enter new password and confirm it to make changes")
                return res.json({ success: false, message: "Please enter new password and confirm it to make changes"})
            }
        
            if (newPassword !== confirmedPassword) {
                console.log("Passwords do not match")
                return res.json({ success: false, message: "Passwords do not match. Please try again"})
            }
    
            updateFields.push("user_password = ?")
            updateValues.push(newPassword)
        }

        if (updateFields.length === 0) {
            console.log("no changes detected")
            return res.json({ success: false, message: "No changes detected."})
        }

        updateValues.push(username)
        let query = `UPDATE users SET ${updateFields.join(', ')} WHERE username = ?`

        db.query(query, updateValues, (err, results) => {
            if (err) {
                console.log(err)
                return res.status(500).json({success: false, message: "Database update error"})
            }

            if(newUsername) req.session.loggedInUser.username = newUsername

            console.log("Successfully update your changes")
            return res.json({ success: true, message: "Successfully updated your changes"})
        })
    })

})

app.post("/update-task-status", isAuthenticated, (req, res) => {
    const { taskId, newStatus } = req.body
    const username = req.session.loggedInUser.username

    const query = "UPDATE tasks SET task_status = ? WHERE username = ? AND task_id = ?"
    db.query(query, [newStatus, username, taskId], (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ success: false, message: "Database connection failed"})
        }

        res.json({ success: true, message: "Task status updated successfully"})
    })
})

app.get("/dashboard", isAuthenticated, (req, res) => {
    const username = req.session.loggedInUser.username

    const queryStatus = "SELECT * FROM tasks WHERE username = ? AND task_status = ?"

    Promise.all([
        new Promise((resolve, reject) => {
            db.query(queryStatus, [username, 'default'], (err, results) => {
                if (err) reject(err)
                else resolve(results)
            })
        }),

        new Promise((resolve, reject) => {
            db.query(queryStatus, [username, 'on-going'], (err, results) => {
                if (err) reject(err)
                else resolve(results)
            })
        }),

        new Promise((resolve, reject) => {
            db.query(queryStatus, [username, 'finished'], (err, results) => {
                if (err) reject(err)
                else resolve(results)
            })
        })
    ])
    .then(([taskDefault, taskOngoing, taskFinished]) => {
        res.render("dashboard", {
            activePage: "dashboard",
            taskDefault, 
            taskOngoing, 
            taskFinished
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({ error: "Database connection error"})
    })
})

app.get("/login", (req, res) => {
    res.render("login", {error: null})
})

app.post("/login", (req, res) => {
    const {username, password} = req.body

    db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database connection error"})
        }

        if (results.length > 0) {
            const user = results[0]

            if (user.user_password === password) {
                req.session.loggedInUser = {
                    username: user.username,
                    profile: user.user_profile
                }
                res.redirect("/dashboard")
            } else {
                res.render("login", {error: "Invalid password"})
            }
        } else {
            res.render("login", {error: "User not found"})
        }
    })
})

app.get("/signup", (req, res) => {
    res.render("signup", {error: null})
})

app.post("/signup", (req, res) => {
    const {username, password, confirmedPassword} = req.body

    if (password !== confirmedPassword) {
        return res.render("signup", {error: "Passwords do not match"})
    }

    db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database connection error"})
        }

        if (results.length > 0) {
            return res.render("signup", {error: "Username already exists"})
        }

        db.query("INSERT INTO users (username, user_password, user_profile) VALUES (?, ?, ?)", [username, password, "/images/profile.jpeg"], (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Database connection error"})
            }

            res.redirect("/login")
        })
    })

})

app.get("/profile", isAuthenticated, (req, res) => {
    res.render("profile", {activePage: "profile"})
})

app.get("/chart", (req, res) => {
    res.render("chart")
})


app.get("/analysis", isAuthenticated, (req, res) => {
    const username = req.session.loggedInUser.username;

    const queryTotal = "SELECT COUNT(*) AS total FROM tasks WHERE username = ?"
    const queryTotalStatus = "SELECT COUNT(*) AS total FROM tasks WHERE username = ? AND task_status = ?";

    Promise.all([
        new Promise((resolve, reject) => {
            db.query(queryTotal, [username], (err, results) => {
                if (err) reject(err);
                else resolve(results[0].total);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queryTotalStatus, [username, 'default'], (err, results) => {
                if (err) reject(err);
                else resolve(results[0].total);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queryTotalStatus, [username, 'on-going'], (err, results) => {
                if (err) reject(err);
                else resolve(results[0].total);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queryTotalStatus, [username, 'finished'], (err, results) => {
                if (err) reject(err);
                else resolve(results[0].total);
            });
        })
    ])
    .then(([totalTasks, defaultTasks, ongoingTasks, finishedTasks]) => {

        res.render("analysis", {
            activePage: "analysis", 
            totalTasks,
            defaultTasks,
            ongoingTasks, 
            finishedTasks
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: "Database connection error" });
    });
});

// app.get("/api/analysis", isAuthenticated, (req, res) => {
//     const username = req.session.loggedInUser.username;

//     const queryTotalStatus = "SELECT COUNT(*) AS total FROM tasks WHERE username = ? AND task_status = ?";

//     Promise.all([
//         new Promise((resolve, reject) => {
//             db.query(queryTotalStatus, [username, 'default'], (err, results) => {
//                 if (err) reject(err);
//                 else resolve(results[0].total);
//             });
//         }),
//         new Promise((resolve, reject) => {
//             db.query(queryTotalStatus, [username, 'on-going'], (err, results) => {
//                 if (err) reject(err);
//                 else resolve(results[0].total);
//             });
//         }),
//         new Promise((resolve, reject) => {
//             db.query(queryTotalStatus, [username, 'finished'], (err, results) => {
//                 if (err) reject(err);
//                 else resolve(results[0].total);
//             });
//         })
//     ])
//     .then(([defaultTasks, ongoingTasks, finishedTasks]) => {

//         res.json({
//             defaultTasks,
//             ongoingTasks, 
//             finishedTasks
//         })
//     })
//     .catch(err => {
//         console.log(err);
//         res.status(500).json({ error: "Database connection error" });
//     });
// });

app.get("/api/analysis", isAuthenticated, (req, res) => {
    const username = req.session.loggedInUser.username;

    const queryTotal = "SELECT COUNT(*) AS total FROM tasks WHERE username = ?";
    const queryStatus = "SELECT task_status, COUNT(*) AS count FROM tasks WHERE username = ? GROUP BY task_status";
    const queryHistory = `
        SELECT DATE(created_at) AS task_date,
            SUM(task_status = 'default') AS default_count,
            SUM(task_status = 'on-going') AS ongoing_count,
            SUM(task_status = 'finished') AS finished_count
        FROM tasks
        WHERE username = ?
        GROUP BY task_date
        ORDER BY task_date ASC
    `;

    Promise.all([
        new Promise((resolve, reject) => {
            db.query(queryTotal, [username], (err, results) => {
                if (err) reject(err);
                else resolve(results[0].total);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queryStatus, [username], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queryHistory, [username], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        })
    ])
    .then(([totalTasks, taskCounts, taskHistory]) => {
        let statusCounts = { default: 0, "on-going": 0, finished: 0 };

        taskCounts.forEach(row => {
            statusCounts[row.task_status] = row.count;
        });

        res.json({
            totalTasks, 
            statusCounts,
            taskHistory
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: "Database connection error" });
    });
});

app.get("/task-edit/:taskId", isAuthenticated, (req, res) => {
    const taskId = req.params.taskId
    const username = req.session.loggedInUser.username

    db.query("SELECT * FROM tasks WHERE task_id = ?", [taskId], (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: "Database error "})
        }

        if (results.length === 0) return res.status(404).json({error: "Task not found"})

        res.render("task-edit", { task: results[0] })
    })
})

app.post("/update-task/:taskId", isAuthenticated, (req, res) => {
    const taskId = req.params.taskId
    const { task_title, task_description, task_status, task_priority } = req.body

    db.query("UPDATE tasks SET task_title = ?, task_description = ?, task_status = ?, task_priority = ? WHERE task_id = ?", 
        [task_title, task_description, task_status, task_priority, taskId],
        (err, results) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error : "Database error"})
            }

            res.redirect("/dashboard")
        }
    )
})

app.post("/create-task", isAuthenticated, (req, res) => {
    const { task_title, task_description, task_priority } = req.body
    const username = req.session.loggedInUser.username

    db.query("INSERT INTO tasks (task_title, task_description, task_status, task_priority, username) VALUES (?, ?, ?, ?, ?)",
        [task_title, task_description, `default`, task_priority, username],
        (err, results) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: "Database error "})
            }

            res.redirect("/dashboard")
        }
    )
})

app.delete("/delete-task/:taskId", isAuthenticated, (req, res) => {
    const taskId = req.params.taskId

    db.query("DELETE FROM tasks WHERE task_id = ?", [taskId], (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ success: false, error : "Database Error"})
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, error: "Task not found"})
        }

        res.json({ success: true })
    })
})

app.get("/task-create", isAuthenticated, (req, res) => {
    res.render("task-create")
})

app.get("/search-result", isAuthenticated, (req, res) => {
    const query = req.query.query
    const username = req.session.loggedInUser.username

    if (!query) {
        return res.render("search-result", { tasks: []})
    }

    const searchQuery = `SELECT * FROM tasks WHERE username = ? AND (task_title LIKE ? OR task_description LIKE ?) ORDER BY created_at DESC`

    db.query(searchQuery, [username, `%${query}%`, `%${query}%`], (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: "Database Connection Error"})
        }

        res.render("search-result", { tasks: results })
    })
})

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err)
            return res.redirect("/dashboard")
        }

        res.render("login", {error: null})
    })
})

app.listen(3000)