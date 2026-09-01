function searchProfiles() {
  let input = document.getElementById("search").value.toLowerCase();
  let cards = document.getElementsByClassName("profile-card");
  for (let card of cards) {
    let name = card.querySelector("h3").innerText.toLowerCase();
    card.style.display = name.includes(input) ? "block" : "none";
  }
}
