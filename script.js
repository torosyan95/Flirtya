// Скрипт Flirtya — логика переходов, регистраций, свайпов

// Welcome экран
const startButton = document.getElementById('start-button');
const welcomeScreen = document.getElementById('welcome-screen');
const registrationScreen = document.getElementById('registration-screen');
const loginScreen = document.getElementById('login-screen');
const mainMenu = document.getElementById('main-menu');

startButton.addEventListener('click', () => {
    welcomeScreen.classList.add('hidden');
    registrationScreen.classList.remove('hidden');
});

// Переходы между регистрацией и логином
document.getElementById('to-login').addEventListener('click', () => {
    registrationScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
});

document.getElementById('to-register').addEventListener('click', () => {
    loginScreen.classList.add('hidden');
    registrationScreen.classList.remove('hidden');
});

// Firebase регистрация
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

// Firebase логин
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

// Простая логика свайпов
const cardArea = document.getElementById('card-area');

const profiles = [
    { name: "Anna, 24" },
    { name: "David, 27" },
    { name: "Sophie, 22" }
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
    currentIndex++;
    loadProfile();
});

document.getElementById('dislike-button').addEventListener('click', () => {
    currentIndex++;
    loadProfile();
});

document.getElementById('superlike-button').addEventListener('click', () => {
    currentIndex++;
    loadProfile();
});

// Меню навигация
document.getElementById('menu-swipes').addEventListener('click', () => {
    document.getElementById('swipe-screen').classList.remove('hidden');
    document.getElementById('profile-screen').classList.add('hidden');
});

document.getElementById('menu-profile').addEventListener('click', () => {
    document.getElementById('swipe-screen').classList.add('hidden');
    document.getElementById('profile-screen').classList.remove('hidden');
});

// Логаут
document.getElementById('logout-button').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        mainMenu.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
    });
});

// Загрузка первого профиля
loadProfile();
