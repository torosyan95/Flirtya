// Скрипт Flirtya — логика приложения

const startButton = document.getElementById('start-button');
const welcomeScreen = document.getElementById('welcome-screen');
const registrationScreen = document.getElementById('registration-screen');
const loginScreen = document.getElementById('login-screen');
const mainMenu = document.getElementById('main-menu');

startButton.addEventListener('click', () => {
  welcomeScreen.classList.add('hidden');
  registrationScreen.classList.remove('hidden');
});

// Переходы регистрация <-> логин
document.getElementById('to-login').addEventListener('click', () => {
  registrationScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
});

document.getElementById('to-register').addEventListener('click', () => {
  loginScreen.classList.add('hidden');
  registrationScreen.classList.remove('hidden');
});

// Регистрация
document.getElementById('register-button').addEventListener('click', () => {
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const dob = document.getElementById('reg-dob').value;

  if (name && email && password && dob) {
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
      })
      .catch((error) => {
        alert(error.message);
      });
  } else {
    alert("Please fill all fields!");
  }
});

// Логин
document.getElementById('login-button').addEventListener('click', () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  if (email && password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        loginScreen.classList.add('hidden');
        mainMenu.classList.remove('hidden');
      })
      .catch((error) => {
        alert(error.message);
      });
  } else {
    alert("Please fill all fields!");
  }
});

// Восстановление пароля
document.getElementById('forgot-password').addEventListener('click', () => {
  const email = prompt("Enter your email to reset password:");
  if (email) {
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        alert('Password reset email sent.');
      })
      .catch((error) => {
        alert(error.message);
      });
  }
});

// Навигация по меню
document.getElementById('menu-swipes').addEventListener('click', () => {
  showScreen('swipe-screen');
});

document.getElementById('menu-profile').addEventListener('click', () => {
  showScreen('profile-screen');
});

function showScreen(screenId) {
  document.getElementById('swipe-screen').classList.add('hidden');
  document.getElementById('profile-screen').classList.add('hidden');
  document.getElementById(screenId).classList.remove('hidden');
}

// Логика свайпов
const cardArea = document.getElementById('card-area');

const profiles = [
  { name: "Anna, 24" },
  { name: "David, 28" },
  { name: "Sophia, 22" }
];

let currentIndex = 0;

function loadProfile() {
  if (currentIndex < profiles.length) {
    cardArea.innerHTML = profiles[currentIndex].name;
  } else {
    cardArea.innerHTML = "No more profiles.";
  }
}

document.getElementById('like-button').addEventListener('click', () => {
  animateSwipe('right');
});

document.getElementById('dislike-button').addEventListener('click', () => {
  animateSwipe('left');
});

document.getElementById('superlike-button').addEventListener('click', () => {
  animateSwipe('up');
});

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

// Логаут
document.getElementById('logout-button').addEventListener('click', () => {
  firebase.auth().signOut().then(() => {
    mainMenu.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
  });
});

// Загрузка профиля
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

loadProfile();
loadProfileInfo();
