const { error } = require('console')
const express = require('express')
const path = require('path')
const session = require('express-session')
const app = express()

app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: 'SECRET_KEY_TO_STORE_IN_ENV_FILE_MAYBE',
    resave: false,
    saveUninitialized: false
}))

app.use((req, res, next) => {
    res.locals.loggedInUser = req.session.loggedInUser || null
    next()
})

app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, 'public')))

const users = [
    { username: "user123", password: "pass123" },
    { username: "john_doe", password: "johndoe" },
    { username: "coder99", password: "code99" }
]

function isAuthenticated(req, res, next) {
    if (req.session.loggedInUser) {
        next()
    } else {
        res.render("login", {error: "You need to login to access pages of the website"})
    }
}

app.get("/generate-username", (req, res) => {
    let username;
    let isUnique = false

    while (!isUnique) {
        username = "user" + Math.floor(Math.random() * 1000)
        isUnique = !users.find(user => user.username === username)
    }

    res.json({ username })
})

app.get("/dashboard", isAuthenticated, (req, res) => {
    res.render("dashboard", {activePage: "dashboard"})
})

app.get("/login", (req, res) => {
    res.render("login", {error: null})
})

app.post("/login", (req, res) => {
    const {username, password} = req.body
    
    const user = users.find(user => user.username === username)

    if (user) {
        if (user.password === password) {
            req.session.loggedInUser = {
                username: user.username,
                password: user.password
            }
            res.redirect("/dashboard")
        } else {
            res.render("login", {error: "Invalid password"})
        }
    } else {
        res.render("login", {error: "User not found"})
    }
})

app.get("/signup", (req, res) => {
    res.render("signup", {error: null})
})

app.post("/signup", (req, res) => {
    const {username, password, confirmedPassword} = req.body

    if (users.find(user => user.username === username)) {
        res.render("signup", {error: "Username already exists"})
    } else if (password !== confirmedPassword) {
        res.render("signup", {error: "Passwords do not match"})
    } else {
        users.push({username, password})
        res.redirect("/login")
    }
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