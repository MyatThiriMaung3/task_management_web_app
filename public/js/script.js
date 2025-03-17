
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

function confirmDelete(taskId) {
    const confirmation = confirm("Are you sure to delete this task?")

    if (confirmation) {
        deleteTask(taskId)
    }
}

function deleteTask(taskId) {
    fetch(`/delete-task/${taskId}`, {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById(`task-${taskId}`).remove()
            showToast("Task deleted successfully", true)
        } else {
            showToast("Failed to delete task", false)
        }
    })
    .catch(error => console.error("Error deleting task: ", error))
}

function openImagePopup() {
    const profileImage = document.querySelector(".large-circle-image").src;
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

function initializeAnalysisCharts(taskHistory, statusCounts) {
    const lineCtx = document.getElementById('taskAnalysisLineChart');
    
    if (!lineCtx) {
        console.error("TaskAnalysisLineChart canvas not found!");
        return;
    }
    
    new Chart(lineCtx.getContext("2d"), {
        type: 'line',
        data: {
            labels: taskHistory.map(task => task.task_date),
            datasets: [
                {
                    label: "Default Tasks",
                    data: taskHistory.map(task => task.default_count),
                    borderColor: "#F8B195"
                },
                {
                    label: "Ongoing Tasks",
                    data: taskHistory.map(task => task.ongoing_count),
                    borderColor: "#89CFF0"
                    
                },
                {
                    label: "Finished Tasks",
                    data: taskHistory.map(task => task.finished_count),
                    borderColor: "#A8D5BA"
                        
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
    
    console.log("Line Chart successfully created!");

    const pieCtx = document.getElementById('taskAnalysisPieChart');
    
    if (!pieCtx) {
        console.error("TaskAnalysisPieChart canvas not found!");
        return;
    }
    
    new Chart(pieCtx.getContext("2d"), {
        type: 'doughnut',
        data: {
            labels: ["Default", "Ongoing", "Finished"],
            datasets: [{
                data: [statusCounts.default, statusCounts["on-going"], statusCounts.finished],
                backgroundColor: ["#F7D488", "#F4C2C2", "#89CFF0"],
                borderColor: ["#F1C27B", "#E8A4A4", "#72B6E8"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
    
    console.log("Pie Chart successfully created!");
}

function checkboxUI() {
    const checkbox = document.getElementById("cbChangePassword");
    const passwordFields = document.querySelectorAll("#profile-newPassword, #profile-confirmedPassword");

    if (checkbox) {
        checkbox.addEventListener("change", function () {
            console.log("🔄 Checkbox Changed:", checkbox.checked);
            passwordFields.forEach(field => {
                field.disabled = !checkbox.checked; // Enable if checked, disable if not
            });
        });
    }
}

function saveChangesUserInfo() {
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
}

function generateUsername() {
    fetch("/generate-username")
    .then(response => response.json())
    .then(data => {
        document.getElementById("signup-username").value = data.username;
    })
    .catch(error => console.error("The error while filling generated username : ", error))
}

function showToast(message, isSuccess) {
    const toast = document.getElementById("toast")
    toast.textContent = message
    toast.className = isSuccess ? "primary-text toast-appear toast-success " : "primary-text toast-appear toast-error"
    document.body.appendChild(toast)

    console.log("✅ Toast created:", toast);
    console.log("✅ Toast created with class:", toast.className);

    setTimeout(() => {
        toast.className = "toast-hidden"
    }, 2000)
}

document.addEventListener("DOMContentLoaded", function (event) {
    console.log("DOM is fully loaded!");

    const currentPage = document.body.getAttribute("data-page");
    console.log("Current Page:", currentPage);

    if (currentPage === "analysis") {
        fetch("/api/analysis")
        .then(response => response.json())
        .then(data => {
            console.log("📊 Fetched Data:", data);
            initializeAnalysisCharts(data.taskHistory, data.statusCounts);
        })
        .catch(error => console.error("Error fetching data:", error));
    } 
    
    if (currentPage === "profile") {

        checkboxUI()

        saveChangesUserInfo()
    }
    

    const searchInput = document.getElementById("search-input")

    if (searchInput) {
        searchInput.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                performSearch(searchInput)
            }
        })
    }
    
});