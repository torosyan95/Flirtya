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
    },
    {
        name: "Sona",
        age: 22,
        city: "Los Angeles",
        interests: "Art, Books",
        image: "https://i.ibb.co/5xq8Psn/profile3.jpg"
    }
];

let currentIndex = 0;

function showProfile(index) {
    const profile = profiles[index];
    document.getElementById('profileImage').src = profile.image;
    document.getElementById('profileName').textContent = `${profile.name}, ${profile.age}`;
    document.getElementById('profileInfo').textContent = `From ${profile.city} | Likes: ${profile.interests}`;
}

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

    document.querySelector('.registration-screen').style.display = 'none';
    document.querySelector('.swipe-screen').style.display = 'block';
    showProfile(currentIndex);
});

document.getElementById('likeBtn').addEventListener('click', function() {
    nextProfile("Liked");
});

document.getElementById('dislikeBtn').addEventListener('click', function() {
    nextProfile("Disliked");
});

document.getElementById('superlikeBtn').addEventListener('click', function() {
    nextProfile("Super Liked");
});

function nextProfile(action) {
    alert(`${action} ${profiles[currentIndex].name}`);
    currentIndex++;
    if (currentIndex >= profiles.length) {
        alert("No more profiles!");
        document.querySelector('.swipe-screen').innerHTML = "<h2>No more profiles</h2>";
        return;
    }
    showProfile(currentIndex);
}