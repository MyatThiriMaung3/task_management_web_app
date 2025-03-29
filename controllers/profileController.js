const User = require('../models/userModel');
const upload = require('../middlewares/uploadMiddleware');

exports.getProfilePage = (req, res) => {
    res.render("profile", {activePage: "profile"});
};

exports.handleUpdateProfile = (req, res) => {
    const username = req.session.loggedInUser.username;
    const profileImage = "/images/" + req.file.filename;

    User.updateUserProfile(profileImage, username, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).render('error', { title: "Database error", status: "500", message: err });
        }

        req.session.loggedInUser.profile = profileImage;
        res.redirect("/profile");
    });
};

exports.handleUpdateUser = (req, res) => {
    const { newUsername, currentPassword, newPassword, confirmedPassword, changePassword } = req.body;
    const username = req.session.loggedInUser.username;

    if (!currentPassword) {
        console.log("Please enter your current password to make changes");
        return res.json({ success: false, message: "Please enter your current password to make changes"});
    }

    if (!newUsername) {
        console.log("Please enter new username or leave it as it is. You can't leave it empty");
        return res.json({ success: false, message: "Please enter new username or leave it as it is. You can't leave it empty"});
    }

    User.findUserByUsername(username, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).render('error', { title: "Database error", status: "500", message: err });
        }

        if (results.length === 0) {
            console.log("User not found");
            return res.json({ success: false, message: "User not found"});
        }

        const user = results[0];

        if (user.user_password !== currentPassword) {
            console.log("Invalid Password");
            return res.json({ success: false, message: "Invalid Password"});
        }

        let updateFields = [];
        let updateValues = [];

        if (newUsername !== username) {
            updateFields.push("username = ?");
            updateValues.push(newUsername);
        }

        if (changePassword === true) {
            if (!newPassword || !confirmedPassword) {
                console.log("Please enter new password and confirm it to make changes");
                return res.json({ success: false, message: "Please enter new password and confirm it to make changes"});
            }
        
            if (newPassword !== confirmedPassword) {
                console.log("Passwords do not match");
                return res.json({ success: false, message: "Passwords do not match. Please try again"});
            }
    
            updateFields.push("user_password = ?");
            updateValues.push(newPassword);
        }

        if (updateFields.length === 0) {
            console.log("no changes detected");
            return res.json({ success: false, message: "No changes detected."});
        }

        updateValues.push(username);

        User.updateUser(updateFields, updateValues, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({success: false, message: "Database update error"});
            }

            if(newUsername) req.session.loggedInUser.username = newUsername;

            console.log("Successfully update your changes");
            return res.json({ success: true, message: "Successfully updated your changes"});
        });

    });

};