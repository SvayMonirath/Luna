const BACKEND_URL = 'http://localhost:5001/';
let audio = new Audio();
let currentSongPath = null;

function playSong(path) {
    if (!path) return;

    // Prepend backend URL
    const fullPath = `${BACKEND_URL}${path}`;

    // If clicking the same song
    if (currentSongPath === fullPath) {
        if (!audio.paused) {
            audio.pause(); // pause if playing
        } else {
            audio.play();  // resume if paused
        }
        return;
    }

    if (!audio.paused) audio.pause(); // stop previous

    audio = new Audio(fullPath);
    audio.play();
    currentSongPath = fullPath;
}



function displaySongs(songs) {
    const container = document.getElementById('song-container');
    container.innerHTML = ''; // clear previous content

    songs.forEach(song => {
        const songDiv = document.createElement('div');
        songDiv.className = "music-container flex flex-col items-center gap-4 p-3 bg-white/5 rounded-lg cursor-pointer sm:flex-col xl:flex-col 2xl:flex-row";

        songDiv.innerHTML = `
            <img src="${BACKEND_URL}${song.cover_image_path}" alt="${song.title} Cover" width="150" height="150" class="rounded-md" />
            <div>
                <div class="text-white font-medium text-2xl xl:text-2xl xl:font-bold 2xl:font-medium 2xl:text-xl">${song.title}</div>
                <div class="text-white font-extralight">${song.artist}</div>
            </div>
        `;

        // play song on click
        songDiv.addEventListener('click', () => playSong(song.audio_file_path));

        container.appendChild(songDiv);
    });
}

async function loadSongs() {
    try {
        const token = localStorage.getItem('accessToken'); // if endpoint requires auth
        const res = await fetch('http://localhost:5001/api/v1/musics/get_random/5', {
            method: 'GET',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });

        if (!res.ok) {
            const data = await res.json();
            console.error('Failed to load songs:', data.message || 'Unknown error');
            return;
        }

        const data = await res.json();
        displaySongs(data.songs);
    } catch (err) {
        console.error('Error fetching songs:', err);
    }
}

// Fetch user info for display (optional)
async function fetchUser() {
    const usernameEL = document.getElementById('usernameDisplay');
    const token = localStorage.getItem('accessToken');

    if(!token) {
        usernameEL.textContent = 'Guest';
        return;
    }

    try {
        const res = await fetch('http://localhost:5001/api/v1/utils/get_user', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
            usernameEL.textContent = 'Guest';
            return;
        }

        const user = await res.json();
        usernameEL.textContent = user.username;
    } catch (err) {
        console.error('Error fetching user:', err);
        usernameEL.textContent = 'Guest';
    }
}

// DOM loaded
document.addEventListener("DOMContentLoaded", () => {
    fetchUser();
    loadSongs();

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenuBtn?.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));

    // Profile menu toggle
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    profileBtn?.addEventListener('click', e => {
        e.stopPropagation();
        profileMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        if (!profileMenu.classList.contains('hidden')) profileMenu.classList.add('hidden');
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        window.location.href = '../login/login.html';
    });
});
