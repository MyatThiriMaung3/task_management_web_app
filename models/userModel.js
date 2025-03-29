const db = require('../config/db');

exports.findUserByUsername = (username, callback) => {
    db.query("SELECT * FROM users WHERE username = ?", [username], callback);
};

exports.createUser = (username, password, callback) => {
    db.query("INSERT INTO users (username, user_password, user_profile) VALUES (?, ?, ?)", 
        [username, password, "/images/profile.jpeg"], 
        callback);
};

exports.updateUser = (updateFields, updateValues, callback) => {
    db.query(`UPDATE users SET ${updateFields.join(', ')} WHERE username = ?`, 
    [...updateValues], 
    callback);
};

exports.updateUserProfile = (newProfile, username, callback) => {
    db.query("UPDATE users SET user_profile = ? WHERE username = ?", 
        [newProfile, username], 
        callback);
};

