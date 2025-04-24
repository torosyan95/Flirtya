const profiles = [
    {
        name: "Anna",
        age: 24,
        city: "Yerevan",
        interests: "Music, Travel",
        image: "https://i.ibb.co/4gH9vZX/profile1.jpg"
    },
    {
        name: "Lena",
        age: 27,
        city: "Tbilisi",
        interests: "Cooking, Movies",
        image: "https://i.ibb.co/ZW6tGQc/profile2.jpg"
    }
];

let currentIndex = 0;

function showProfile(index) {
    const profile = profiles[index];
    document.getElementById('profileImage').src = profile.image;
    document.getElementById('profileName').textContent = `${profile.name}, ${profile.age}`;
    document.getElementById('profileInfo').textContent = `From ${profile.city} | Likes: ${profile.interests}`;
}

function calculateAge(dob) {
    const [d, m, y] = dob.split('.').map(Number);
    const birthDate = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const mDiff = today.getMonth() - birthDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

document.getElementById('loginBtn').onclick = () => {
    document.querySelector('.main-screen').classList.add('hidden');
    document.querySelector('.login-screen').classList.remove('hidden');
};

document.getElementById('registerBtn').onclick = () => {
    document.querySelector('.main-screen').classList.add('hidden');
    document.querySelector('.register-screen').classList.remove('hidden');
};

document.querySelectorAll('.backBtn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.login-screen, .register-screen, .swipe-screen').forEach(el => el.classList.add('hidden'));
        document.querySelector('.main-screen').classList.remove('hidden');
    };
});

document.getElementById('loginSubmit').onclick = () => {
    const input = document.getElementById('loginInput').value.trim();
    if (input) {
        alert("Login successful!");
        document.querySelector('.login-screen').classList.add('hidden');
        document.querySelector('.swipe-screen').classList.remove('hidden');
        showProfile(currentIndex);
    } else {
        alert("Enter your phone or email!");
    }
};

document.getElementById('regSubmit').onclick = () => {
    const name = document.getElementById('regName').value.trim();
    const dob = document.getElementById('regDob').value.trim();
    const gender = document.getElementById('regGender').value;
    const city = document.getElementById('regCity').value.trim();
    const terms = document.getElementById('regTerms').checked;

    if (!name || !dob || !gender || !city || !terms) {
        alert("Fill all fields and accept Terms.");
        return;
    }

    const age = calculateAge(dob);
    if (age < 18) {
        alert("You must be 18+ to register.");
        return;
    }

    alert("Account created! Welcome to Flirtya.");
    document.querySelector('.register-screen').classList.add('hidden');
    document.querySelector('.swipe-screen').classList.remove('hidden');
    showProfile(currentIndex);
};

document.getElementById('likeBtn').onclick = () => {
    currentIndex++;
    if (currentIndex >= profiles.length) {
        alert("No more profiles!");
    } else {
        showProfile(currentIndex);
    }
};

document.getElementById('dislikeBtn').onclick = () => {
    currentIndex++;
    if (currentIndex >= profiles.length) {
        alert("No more profiles!");
    } else {
        showProfile(currentIndex);
    }
};

document.getElementById('superlikeBtn').onclick = () => {
    alert("Super Like sent!");
    currentIndex++;
    if (currentIndex >= profiles.length) {
        alert("No more profiles!");
    } else {
        showProfile(currentIndex);
    }
};function showScreen(screen) {
    document.querySelectorAll('.swipe-screen, .profile-screen, .chat-screen, .main-screen, .login-screen, .register-screen').forEach(s => s.classList.add('hidden'));
    document.querySelector('.main-menu').classList.remove('hidden');
    document.querySelector(`.${screen}`).classList.remove('hidden');
}

document.getElementById('menuSwipe').onclick = () => showScreen('swipe-screen');
document.getElementById('menuProfile').onclick = () => showScreen('profile-screen');
document.getElementById('menuChat').onclick = () => showScreen('chat-screen');

// Активировать меню после логина/регистрации
function activateMenu() {
    document.querySelector('.main-menu').classList.remove('hidden');
}

document.getElementById('loginSubmit').addEventListener('click', () => {
    const input = document.getElementById('loginInput').value.trim();
    if (input) {
        alert("Login successful!");
        showScreen('swipe-screen');
        showProfile(currentIndex);
        activateMenu();
    }
});

document.getElementById('regSubmit').addEventListener('click', () => {
    const name = document.getElementById('regName').value.trim();
    const dob = document.getElementById('regDob').value.trim();
    const gender = document.getElementById('regGender').value;
    const city = document.getElementById('regCity').value.trim();
    const terms = document.getElementById('regTerms').checked;

    if (!name || !dob || !gender || !city || !terms) {
        alert("Fill all fields and accept Terms.");
        return;
    }

    const age = calculateAge(dob);
    if (age < 18) {
        alert("You must be 18+ to register.");
        return;
    }

    alert("Account created! Welcome to Flirtya.");
    showScreen('swipe-screen');
    showProfile(currentIndex);
    activateMenu();
    document.getElementById('profileUsername').textContent = name;
});
function openTelegramInvoice(title, description, payload, price) {
    Telegram.WebApp.openInvoice({
        title: title,
        description: description,
        currency: "USD",
        prices: [{ label: title, amount: price * 100 }],
        payload: payload,
        provider_token: "c609e7ea1892bb5cb7728ea74c0892e761c10c2a",
        start_parameter: "purchase"
    });
}

document.getElementById('profileUsername').addEventListener('click', () => {
    showScreen('vip-screen');
});
