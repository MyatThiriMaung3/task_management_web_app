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
    const checkbox = document.getElementById("changePassword");
    const passwordFields = document.querySelectorAll("#newPassword, #confirmedPassword");

    checkbox.addEventListener("change", function () {
        passwordFields.forEach(field => {
            field.disabled = !checkbox.checked; // Enable if checked, disable if not
        });
    });
});

function generateUsername() {
    fetch("/generate-username")
    .then(response => response.json())
    .then(data => {
        document.getElementById("signup-username").value = data.username;
    })
    .catch(error => console.error("The error while filling generated username : ", error))
}


document.addEventListener("DOMContentLoaded", function () {
    // Get canvas elements
    const lineCtx = document.getElementById('taskAnalysisLineChart').getContext('2d');
    const barCtx = document.getElementById('taskAnalysisBarChart').getContext('2d');
    const pieCtx = document.getElementById('taskAnalysisPieChart').getContext('2d');


    // Sample X-axis labels
    const labels = ["Jan", "Feb", "Mar", "Apr", "May"];

    // Define three datasets for line chart
    const lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Dataset 1",
                    data: [12, 19, 3, 5, 2], // Y values
                    borderColor: "red",
                    backgroundColor: "rgba(255, 0, 0, 0.2)",
                    fill: true
                },
                {
                    label: "Dataset 2",
                    data: [5, 15, 10, 8, 7],
                    borderColor: "blue",
                    backgroundColor: "rgba(0, 0, 255, 0.2)",
                    fill: true
                },
                {
                    label: "Dataset 3",
                    data: [8, 6, 15, 12, 14],
                    borderColor: "green",
                    backgroundColor: "rgba(0, 255, 0, 0.2)",
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { enabled: true }
            }
        }
    });

    // Define three datasets for bar chart
    const barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Dataset 1",
                    data: [10, 14, 8, 7, 12],
                    backgroundColor: "red"
                },
                {
                    label: "Dataset 2",
                    data: [7, 9, 15, 10, 6],
                    backgroundColor: "blue"
                },
                {
                    label: "Dataset 3",
                    data: [12, 7, 10, 14, 8],
                    backgroundColor: "green"
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { enabled: true }
            },
            scales: {
                y: { beginAtZero: true } // Ensures bars start at 0
            }
        }
    });
});
