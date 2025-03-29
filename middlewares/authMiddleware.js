module.exports = (req, res, next) => {
    if (req.session.loggedInUser) {
        next();
    } else {
        res.render("login", {error: "You need to login to access pages of the website"});
    }
}