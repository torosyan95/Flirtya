document.getElementById('getStartedBtn').addEventListener('click', function() {
    alert('Next screen: Registration, Swipes, VIP, etc. This is just the welcome screen!');
});
document.getElementById('getStartedBtn').addEventListener('click', function() {
    document.querySelector('.welcome-screen').style.display = 'none';
    document.querySelector('.registration-screen').style.display = 'block';
});

document.getElementById('registerBtn').addEventListener('click', function() {
    const name = document.getElementById('nameInput').value;
    const age = document.getElementById('ageInput').value;
    const gender = document.getElementById('genderSelect').value;
    const city = document.getElementById('cityInput').value;

    if (!name || !age || !gender) {
        alert("Please fill in all required fields.");
        return;
    }

    alert(`Welcome, ${name}! Your profile has been created. (Next: Swipe screen)`);
});
