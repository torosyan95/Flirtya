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

// Регистрация пользователя
function submitRegistration() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const dob = document.getElementById('regDOB').value;
  const gender = document.getElementById('regGender').value;
  const city = document.getElementById('regCity').value;
  const music = document.getElementById('regMusic').value;
  const words = document.getElementById('regWords').value;
  const refCode = document.getElementById('refCode').value;
  const acceptTerms = document.getElementById('acceptTerms').checked;

  if (!name || !email || !password || !dob || !gender || !city || !acceptTerms) {
    alert('Please fill all fields and accept terms.');
    return;
  }

  // Здесь будет отправка данных в Firebase
  console.log('Registered user:', name, email, dob, gender, city, music, words, refCode);
  alert('Welcome to Flirtya, ' + name + '!');
  goTo('menu');
}

// Вход пользователя
function loginUser() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    alert('Enter your email and password.');
    return;
  }

  // Здесь будет проверка через Firebase
  console.log('Login attempt:', email);
  alert('Login successful!');
  goTo('menu');
}

// Покупка VIP
function buyVIP() {
  alert('Redirecting to VIP payment...');
  // Здесь можно подключить Telegram Pay или Stripe
}

// Покупка VIP+
function buyVIPPlus() {
  alert('Redirecting to VIP+ payment...');
  // Здесь можно подключить Telegram Pay или Stripe
}
