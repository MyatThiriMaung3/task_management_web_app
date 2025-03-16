


function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

function goToDashboard() {
    window.location.href = "/dashboard";
}

function showTaskDetails(event, taskElement) {
    if (event.target.tagName === "BUTTON" || event.target.classList.contains("fa-ellipsis-h") ) {
        return
    }
    console.log("show task details has been called")

    const popupContainer = document.getElementById("popupTaskContainer")
    const popupOverlay = document.getElementById("taskDetailsPopup")
    
    popupContainer.innerHTML = ""

    const clonedTask = taskElement.cloneNode(true)
    popupContainer.appendChild(clonedTask)

    popupOverlay.style.display = "flex"
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

function updateTaskStatus(task_id, newStatus) {
    const taskId = Number(task_id)

    fetch("/update-task-status", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ 
            taskId, 
            newStatus 
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            moveTaskInUI(taskId, newStatus)
        } else {
            alert("Failed to update task status")
        }
    })
    .catch(error => console.error("Error updating task: ", error))
}


function moveTaskInUI(taskId, newStatus) {
    const taskElement = document.getElementById(`task-${taskId}`)

    if (!taskElement) return;

    taskElement.remove();

    if (newStatus === 'on-going') {
        const button = taskElement.querySelector("button")
        button.textContent = "Finish Task"
        button.className = "primary-small-text finish-task-box"
        button.setAttribute("onclick", `updateTaskStatus('${taskId}', 'finished')`)
        document.getElementById("taskOngoingContainer").appendChild(taskElement)
    } else if (newStatus === 'finished') {
        taskElement.querySelector("button").remove()
        document.getElementById("taskFinishedContainer").appendChild(taskElement)
    }
}

function performSearch(searchInput) {
    const query = searchInput.value.trim()
    if (query.length === 0) return
    
    window.location.href = `/search-result?query=${encodeURIComponent(query)}`

}

document.addEventListener("DOMContentLoaded", function (event) {
    


    console.log("DOM is fully loaded!");

    const searchInput = document.getElementById("search-input")

    if (searchInput) {
        searchInput.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                performSearch(searchInput)
            }
        })
    }

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