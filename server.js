const express = require('express')
const app = express()

app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.send('hello')
})

app.listen(3000)