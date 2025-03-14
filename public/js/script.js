
function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

function goToDashboard() {
    window.location.href = "/dashboard";
}


function openImagePopup() {
    const profileImage = document.querySelector(".profile-image-size").src;
    document.querySelector("#imagePopup img").src = profileImage; // Set image dynamically
    document.getElementById("imagePopup").style.display = "flex";
}

function openForgotPasswordPopup() {
    document.getElementById("forgotPasswordPopup").style.display = "flex";
}

function closePopup(tempPopup) {
    document.getElementById(tempPopup).style.display = "none";
}


document.addEventListener("DOMContentLoaded", function () {
    // const menu = document.getElementById("menuDropdown");
    // const menuIcon = document.querySelector(".ic-menu-size");

    // if(menu && menuIcon) {
    //     document.addEventListener("click", function(event) {
    //         if (!menu.contains(event.target) && event.target !== menuIcon) {
    //             menu.style.display = "none";
    //         }
    //     })
    // }

    console.log("DOM is fully loaded!");

    const checkbox = document.getElementById("cbChangePassword");
    const passwordFields = document.querySelectorAll("#profile-newPassword, #profile-confirmedPassword");

    if (checkbox) {
        checkbox.addEventListener("change", function () {
            passwordFields.forEach(field => {
                field.disabled = !checkbox.checked; // Enable if checked, disable if not
            });
        });
    }

    const saveButton = document.getElementById("btnSaveChanges")
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const newUsername = document.getElementById('profile-username').value
            const currentPassword = document.getElementById('profile-currentPassword').value
            const newPassword = document.getElementById('profile-newPassword').value
            const confirmedPassword = document.getElementById('profile-confirmedPassword').value
            const changePassword = document.getElementById('cbChangePassword').checked

            fetch("/update-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    newUsername,
                    currentPassword,
                    newPassword,
                    confirmedPassword,
                    changePassword
                })
            })
            .then(response => response.json())
            .then(data => {
                showToast(data.message, data.success)
            })
            .catch (error => console.error(error))
                })
            }
});

function generateUsername() {
    fetch("/generate-username")
    .then(response => response.json())
    .then(data => {
        document.getElementById("signup-username").value = data.username;
    })
    .catch(error => console.error("The error while filling generated username : ", error))
}


function showToast(message, isSuccess) {
    const toast = document.createElement("div")
    toast.textContent = message
    toast.className = isSuccess ? "toast success" : "toast error"
    document.body.appendChild(toast)

    setTimeout(() => {toast.remove(); }, 2000)
}