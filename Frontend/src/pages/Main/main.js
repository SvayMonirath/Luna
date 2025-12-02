import { loadSongsHeader, loadTrendingSongs , fetchUser  } from './main_utils.js';
import { loadRooms } from './main_room.js';

document.addEventListener("DOMContentLoaded", () => {
    fetchUser();
    loadSongsHeader();
    loadTrendingSongs();

    // FIXME[]: loadRooms function not get called ever
    loadRooms();

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
