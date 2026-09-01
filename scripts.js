const toggleBtn = document.getElementById("darkToggle");
const icon = toggleBtn.querySelector("i");

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  // Switch icon between moon and sun
  if (document.body.classList.contains("dark")) {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  } else {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  }
});
