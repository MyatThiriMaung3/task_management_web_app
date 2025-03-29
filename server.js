require('dotenv').config();

const express = require('express');
const session = require('express-session');
const multer = require("multer");
const path = require('path');
const cors = require('cors');
const { error } = require('console');
const { resolve } = require('path/posix');
const { rejects } = require('assert');
const { finished } = require('stream');


const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// session 
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false
}));

// middleware to make loggedInUser available in views
app.use((req, res, next) => {
    res.locals.loggedInUser = req.session.loggedInUser || null;
    next();
});

// routes from routes directory
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const profileRoutes = require('./routes/profileRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

// using the routes above
app.use('/', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/profile', profileRoutes);
app.use('/analysis', analysisRoutes);

app.use('*', (req, res) => {
    res.status(404).render('error', { title: "Page Not Found", message: "Invalid Route Address", status: "404" });
});

app.listen(3000);