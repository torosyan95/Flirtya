document.getElementById('loginBtn').onclick = () => {
    document.querySelector('.main-screen').classList.add('hidden');
    document.querySelector('.login-screen').classList.remove('hidden');
};

document.getElementById('registerBtn').onclick = () => {
    document.querySelector('.main-screen').classList.add('hidden');
    document.querySelector('.register-screen').classList.remove('hidden');
};

document.getElementById('loginSubmit').onclick = () => {
    const phone = document.getElementById('loginPhone').value;
    if (phone) {
        alert("Login successful!");
    } else {
        alert("Enter your phone number!");
    }
};

document.getElementById('regSubmit').onclick = () => {
    const name = document.getElementById('regName').value;
    const age = document.getElementById('regAge').value;
    const gender = document.getElementById('regGender').value;
    const city = document.getElementById('regCity').value;
    if (name && age && gender && city) {
        alert("Account created! Swipe screen coming next.");
    } else {
        alert("Fill all fields!");
    }
};