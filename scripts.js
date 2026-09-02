const toggleBtn = document.getElementById("darkToggle");
const icon = toggleBtn.querySelector("i");

// Apply saved mode when page loads
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
}

// Toggle dark mode
toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");

        localStorage.setItem("darkMode", "enabled");
    } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");

        localStorage.setItem("darkMode", "disabled");
    }
});
