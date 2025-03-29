require('dotenv').config();
const User = require('../models/userModel');

exports.getLoginPage = (req, res) => {
    res.render("login", {error: null});
};

exports.handleLogin = (req, res) => {
    const {username, password} = req.body;

    User.findUserByUsername(username, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).render('error', { title: "Database error", status: "500", message: err });
        }

        if (results.length > 0) {
            const user = results[0]

            if (user.user_password === password) {
                req.session.loggedInUser = {
                    username: user.username,
                    profile: user.user_profile
                }
                res.redirect("/tasks/dashboard");
            } else {
                res.render("login", {error: "Invalid password"});
            }
        } else {
            res.render("login", {error: "User not found"})
        }
    });
};

exports.getSignupPage = (req, res) => {
    res.render("signup", {error: null});
};

exports.handleSignup = (req, res) => {
    const {username, password, confirmedPassword} = req.body

    if (password !== confirmedPassword) {
        return res.render("signup", {error: "Passwords do not match"})
    }

    User.findUserByUsername(username, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).render('error', { title: "Database error", status: "500", message: err });
        }

        if (results.length > 0) {
            return res.render("signup", {error: "Username already exists"});
        }

        User.createUser(username, password, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).render('error', { title: "Database error", status: "500", message: err });
            }

            res.redirect("/login");
        });
    });

};

exports.handleGenerateUsername = async (req, res) => {
    const generateUniqueUsername = async () => {
        const username = "user" + Math.floor(Math.random() * 1000);

        User.findUserByUsername(username, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).render('error', { title: "Database error", status: "500", message: err });
            }

            if (results.length === 0) {
                return res.json({ username }); // Return unique username if available
            } else {
                generateUniqueUsername(); // Retry if username exists
            }
        });
    };

    generateUniqueUsername();
};

exports.handleLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.redirect("/tasks/dashboard");
        }

        res.render("login", {error: null});
    });
};