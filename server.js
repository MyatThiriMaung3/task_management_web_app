const { error } = require('console')
require('dotenv').config()
const express = require('express')
const path = require('path')
const session = require('express-session')
const multer = require('multer')
const app = express()
const cors = require('cors')
const db = require('./db')

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

app.post("/upload-profile", isAuthenticated, upload.single("profileImage"), (req, res) => {
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

app.get("/dashboard", isAuthenticated, (req, res) => {
    res.render("dashboard", {activePage: "dashboard"})
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

        if (results > 0) {
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

app.get("/analysis", isAuthenticated, (req, res) => {
    res.render("analysis", {activePage: "analysis"})
})

app.get("/search-result", isAuthenticated, (req, res) => {
    res.render("search-result")
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