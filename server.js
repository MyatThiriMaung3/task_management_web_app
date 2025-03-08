const express = require('express')
const path = require('path')
const app = express()

app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, 'public')))


app.get("/", (req, res) => {
    res.render("dashboard")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.get("/profile", (req, res) => {
    res.render("profile")
})

app.listen(3000)