const startButton = document.getElementById('start-button');
const welcomeScreen = document.getElementById('welcome-screen');
const registrationScreen = document.getElementById('registration-screen');
const loginScreen = document.getElementById('login-screen');
const mainMenu = document.getElementById('main-menu');
const swipeScreen = document.getElementById('swipe-screen');
const profileScreen = document.getElementById('profile-screen');

startButton.addEventListener('click', () => {
  welcomeScreen.classList.add('hidden');
  registrationScreen.classList.remove('hidden');
});

document.getElementById('to-login').addEventListener('click', () => {
  registrationScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
});

document.getElementById('to-register').addEventListener('click', () => {
  loginScreen.classList.add('hidden');
  registrationScreen.classList.remove('hidden');
});

document.getElementById('register-button').addEventListener('click', () => {
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const dob = document.getElementById('reg-dob').value;
  const termsAccepted = document.getElementById('terms').checked;

  if (!termsAccepted) {
    alert("Please accept the Terms.");
    return;
  }

  const birthYear = new Date(dob).getFullYear();
  const currentYear = new Date().getFullYear();
  if (currentYear - birthYear < 18) {
    alert("You must be at least 18 years old.");
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid;
      firebase.database().ref('users/' + userId).set({
        name: name,
        email: email,
        dob: dob
      });
      registrationScreen.classList.add('hidden');
      mainMenu.classList.remove('hidden');
      loadProfileInfo();
      loadProfile();
    })
    .catch((error) => {
      alert(error.message);
    });
});

document.getElementById('login-button').addEventListener('click', () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      loginScreen.classList.add('hidden');
      mainMenu.classList.remove('hidden');
      loadProfileInfo();
      loadProfile();
    })
    .catch((error) => {
      alert(error.message);
    });
});

document.getElementById('forgot-password').addEventListener('click', () => {
  const email = prompt("Enter your email to reset password:");
  if (email) {
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => alert("Password reset email sent."))
      .catch((error) => alert(error.message));
  }
});

// Меню навигация
document.getElementById('menu-swipes').addEventListener('click', () => {
  showScreen('swipe-screen');
});
document.getElementById('menu-profile').addEventListener('click', () => {
  showScreen('profile-screen');
});
function showScreen(screenId) {
  swipeScreen.classList.add('hidden');
  profileScreen.classList.add('hidden');
  document.getElementById(screenId).classList.remove('hidden');
}

// Свайпы (примерные профили)
const profiles = [
  { name: "Anna, 24" },
  { name: "David, 28" },
  { name: "Sophia, 22" }
];
let currentIndex = 0;
const cardArea = document.getElementById('card-area');

function loadProfile() {
  if (currentIndex < profiles.length) {
    cardArea.innerHTML = profiles[currentIndex].name;
  } else {
    cardArea.innerHTML = "No more profiles.";
  }
}
document.getElementById('like-button').addEventListener('click', () => animateSwipe('right'));
document.getElementById('dislike-button').addEventListener('click', () => animateSwipe('left'));
document.getElementById('superlike-button').addEventListener('click', () => animateSwipe('up'));

function animateSwipe(direction) {
  cardArea.style.transition = 'transform 0.5s ease';
  if (direction === 'right') cardArea.style.transform = 'translateX(150%)';
  if (direction === 'left') cardArea.style.transform = 'translateX(-150%)';
  if (direction === 'up') cardArea.style.transform = 'translateY(-150%)';

  setTimeout(() => {
    cardArea.style.transition = 'none';
    cardArea.style.transform = 'none';
    currentIndex++;
    loadProfile();
  }, 500);
}

// Профиль
function loadProfileInfo() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      firebase.database().ref('users/' + user.uid).once('value').then((snapshot) => {
        const userInfo = snapshot.val();
        document.getElementById('profile-info').innerHTML = `
          <p><strong>Name:</strong> ${userInfo.name}</p>
          <p><strong>Email:</strong> ${userInfo.email}</p>
          <p><strong>Date of Birth:</strong> ${userInfo.dob}</p>
        `;
      });
    }
  });
}

// Logout
document.getElementById('logout-button').addEventListener('click', () => {
  firebase.auth().signOut().then(() => {
    mainMenu.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
  });
});

loadProfile();
loadProfileInfo();

// Заглушка VIP (пока без оплаты)
let vipStatus = false;
let superlikes = 3;

document.getElementById('menu-vip').addEventListener('click', () => {
  alert(vipStatus ? "You are already VIP!" : "Upgrade to VIP to unlock more features.");
});

document.getElementById('superlike-button').addEventListener('click', () => {
  if (superlikes > 0 || vipStatus) {
    superlikes--;
    animateSwipe('up');
  } else {
    alert("You used all Superlikes. Buy VIP to get more.");
  }
});

// Заглушка Telegram Pay
function showPayOptions() {
  alert("Telegram Pay coming soon. Prices: VIP 7 days – $6.99, 30 days – $19.99");
}

// Подтверждение возраста при регистрации
function checkAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  return age >= 18;
}

// Фильтры (заготовка)
const countries = {
  "USA": ["New York", "Los Angeles", "Chicago"],
  "Germany": ["Berlin", "Hamburg", "Munich"],
  "Georgia": ["Tbilisi", "Batumi", "Kutaisi"]
};

const countrySelect = document.getElementById('reg-country');
const citySelect = document.getElementById('reg-city');

function populateCountries() {
  for (const country in countries) {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
  }
}

countrySelect.addEventListener('change', () => {
  const selected = countrySelect.value;
  citySelect.innerHTML = "";
  countries[selected].forEach(city => {
    const opt = document.createElement('option');
    opt.value = city;
    opt.textContent = city;
    citySelect.appendChild(opt);
  });
});

populateCountries();

// Реферальная система (заглушка)
let referralBonus = 0;
function applyReferralCode(code) {
  if (code === "FLIRTYA") {
    referralBonus += 1;
    alert("Referral applied. You earned 1 day VIP!");
  }
}
