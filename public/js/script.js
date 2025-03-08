document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if (username && password) {
        alert("Login successful!");
    } else {
        alert("Please enter both username and password.");
    }
});

document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const confirmedPassword = document.getElementById("confirmedPassword").value;
    const password = document.getElementById("password").value;
    if (confirmedPassword === password) {
        alert("Signup successful!");
    } else {
        alert("Passwords do not match. Please try again.");
    }
});

function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

// Close menu when clicking outside
document.addEventListener("click", function(event) {
    const menu = document.getElementById("menuDropdown");
    const menuIcon = document.querySelector(".ic-menu-size");

    if (!menu.contains(event.target) && event.target !== menuIcon) {
        menu.style.display = "none";
    }
});

