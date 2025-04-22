const goToScreen = (id) => {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
};

const register = () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const dob = document.getElementById("dob").value;
  const photo = document.getElementById("photo").files[0];

  if (!name || !email || !dob || !photo) {
    alert("Заполните все поля.");
    return;
  }

  const age = new Date().getFullYear() - new Date(dob).getFullYear();
  if (age < 18) {
    alert("Только для 18+");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    localStorage.setItem("flirtya_user", JSON.stringify({
      name,
      email,
      age,
      photo: e.target.result
    }));
    showProfile();
  };
  reader.readAsDataURL(photo);
};

const showProfile = () => {
  const data = JSON.parse(localStorage.getItem("flirtya_user"));
  if (!data) return;

  document.getElementById("profileName").textContent = `Имя: ${data.name}`;
  document.getElementById("profileEmail").textContent = `Email: ${data.email}`;
  document.getElementById("profileAge").textContent = `Возраст: ${data.age}`;
  goToScreen("profileScreen");
};

window.onload = () => {
  if (localStorage.getItem("flirtya_user")) {
    showProfile();
  } else {
    goToScreen("welcomeScreen");
  }
};