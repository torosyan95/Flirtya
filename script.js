// Переключение между экранами
function goTo(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// Запуск приложения
window.onload = () => {
  goTo('welcome');
};

// Регистрация
function submitRegistration() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const dob = document.getElementById("regDOB").value;
  const gender = document.getElementById("regGender").value;
  const city = document.getElementById("regCity").value;
  const music = document.getElementById("regMusic").value;
  const words = document.getElementById("regWords").value;
  const ref = document.getElementById("refCode").value;
  const terms = document.getElementById("acceptTerms").checked;

  if (!name || !email || !password || !dob || !gender || !city || !terms) {
    alert("Please fill all required fields and accept the terms.");
    return;
  }

  // Firebase регистрация (заготовка)
  console.log("Registered:", name, email, dob, gender, city, music, words, ref);
  alert("Welcome to Flirtya, " + name + "!");
  goTo("menu");
}

// Вход
function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Enter email and password.");
    return;
  }

  // Firebase вход (заготовка)
  console.log("Login:", email);
  alert("Login successful!");
  goTo("menu");
}
