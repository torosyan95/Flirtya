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

document.getElementById('menuProfile').addEventListener('dblclick', () => {
    showScreen('premium-screen');
});

let purchaseHistory = [];
let vipStatus = null;

function openTelegramInvoice(title, description, payload, price) {
    Telegram.WebApp.openInvoice({
        title: title,
        description: description,
        currency: "USD",
        prices: [{ label: title, amount: price * 100 }],
        payload: payload,
        provider_token: "c609e7ea1892bb5cb7728ea74c0892e761c10c2a",
        start_parameter: "purchase",
        callback: () => {
            const purchase = { title, price, date: new Date().toLocaleString() };
            purchaseHistory.push(purchase);
            updatePurchaseHistory();

            if (payload.includes("vip")) {
                vipStatus = {
                    plan: title,
                    until: calculateVIPEndDate(payload)
                };
                updateProfileStatus();
            }
        }
    });
}

function calculateVIPEndDate(payload) {
    const days = payload.includes("30") ? 30 : 7;
    const now = new Date();
    now.setDate(now.getDate() + days);
    return now.toLocaleDateString();
}

function updateProfileStatus() {
    if (vipStatus) {
        document.getElementById("profileUsername").innerHTML = `Your Name <span style='color: gold;'>(${vipStatus.plan})</span><br><small>Until: ${vipStatus.until}</small>`;
    }
}

function updatePurchaseHistory() {
    const list = document.getElementById("purchaseList");
    list.innerHTML = "";
    purchaseHistory.forEach(p => {
        list.innerHTML += `<p><strong>${p.title}</strong> — $${p.price} <br><small>${p.date}</small></p><hr>`;
    });
}

document.getElementById("menuProfile").addEventListener("dblclick", () => {
    showScreen("premium-screen");
});

document.getElementById("menuProfile").addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showScreen("purchase-history-screen");
});

document.getElementById('loginBtn').onclick = () => {
    showScreen('firebase-login-screen');
};

document.getElementById('registerBtn').onclick = () => {
    showScreen('firebase-register-screen');
};

document.getElementById('firebaseLoginBtn').onclick = () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Login successful!");
            showScreen('swipe-screen');
            showProfile(currentIndex);
            activateMenu();
        })
        .catch((error) => {
            alert("Login failed: " + error.message);
        });
};

document.getElementById('firebaseRegisterBtn').onclick = () => {
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const name = document.getElementById('regName').value.trim();
    const dob = document.getElementById('regDobDate').value;
    const gender = document.getElementById('regGender').value;
    const city = document.getElementById('regCity').value.trim();
    const terms = document.getElementById('regTerms').checked;

    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    if (!name || !email || !password || !dob || !gender || !city || !terms) {
        alert("Please complete all fields and accept terms.");
        return;
    }

    if (age < 18) {
        alert("You must be 18+ to register.");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Account created successfully!");
            showScreen('swipe-screen');
            showProfile(currentIndex);
            activateMenu();
            document.getElementById('profileUsername').textContent = name;
        })
        .catch((error) => {
            alert("Registration failed: " + error.message);
        });
};
