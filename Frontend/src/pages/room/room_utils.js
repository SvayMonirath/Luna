import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

const socket = io('http://localhost:5001');

export default socket;


const BACKEND_URL = 'http://localhost:5001/api/v1';
const popupText = document.getElementById("popupText");
const popupMessage = document.getElementById("popupMessage");

// Show popup message
function showPopup(message, type = "success") {
    const popup = document.getElementById("popupMessage");
    const text = document.getElementById("popupText");

    // Set the text
    text.textContent = message;

    // Reset previous type classes
    popup.classList.remove(
        "bg-green-500/30", "border-green-400/40",
        "bg-red-500/30", "border-red-400/40",
        "bg-yellow-500/30", "border-yellow-400/40"
    );

    // Add classes based on type
    if (type === "success") {
        popup.classList.add("bg-green-500/30", "border-green-400/40");
    } else if (type === "error") {
        popup.classList.add("bg-red-500/30", "border-red-400/40");
    } else if (type === "warning") {
        popup.classList.add("bg-yellow-500/30", "border-yellow-400/40");
    }

    // Show popup
    popup.classList.remove("opacity-0");
    popup.classList.add("opacity-100");

    setTimeout(() => {
        popup.classList.add("opacity-0");
        popup.classList.remove("opacity-100");
    }, 7000);
}

// TODO[X]: Fetch Room Name
// TODO[X]: Fetch Room Vibe
const roomName = document.getElementById('room-name');
const roomVibe = document.getElementById('room-vibe');
const roomCode = document.getElementById('room-code');

const ChangeRoomNameInput = document.getElementById("room-name-input");
const ChangeRoomVibeInput = document.getElementById("room-vibe-input");

export async function fetchRoomInfo() {
    const params = new URLSearchParams(window.location.search);
    const room_id = params.get('room_id');
    let dataPrivate = {};

    const user = await fetchUser();

    if(!user) {
        showPopup("You must be logged in to access this room.", "error");
        window.location.href = '../Main/main.html';
        return;
    }

    const listenersCount = document.getElementById('listener-count');
    console.log("listenersCount element:", listenersCount);

    socket.emit('join_room', { room_id, user_id: user.id });

    socket.on('listener_count_update', (data) => {
        console.log("Received listener_count_update:", data);
        if (data.room_id.toString() === room_id) {
            listenersCount.textContent = data.listeners_count;
        }
    });

    try {
        const resPrivate = await fetch(`${BACKEND_URL}/rooms/get_room_private_status/${room_id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        dataPrivate = await resPrivate.json();

    } catch (error) {
        console.error('Error fetching room private status:', error);
    }


    const roomToken = localStorage.getItem(`roomToken_${room_id}`);
    const headers = { 'Content-Type': 'application/json' };

    if (roomToken && dataPrivate.is_private) {
        headers['Authorization'] = `Bearer ${roomToken}`;
    } else if (dataPrivate.is_private && !roomToken) {
        showPopup("You cannot access this room.", "error");
        window.location.href = '../Main/main.html';
        return;
    }

    try {
        const res = await fetch(`${BACKEND_URL}/rooms/get_room/${room_id}`, {
            method: 'GET',
            headers
        });

        const data = await res.json();

        if (!res.ok) {
            showPopup(data.message || "You cannot access this room.", "error");
            window.location.href = '../Main/main.html';
            return;
        }

        // All good → update UI
        roomName.textContent = data.room.title;
        roomVibe.textContent = data.room.vibe;
        roomCode.textContent = data.room.code;
        ChangeRoomNameInput.value = data.room.title;
        ChangeRoomVibeInput.value = data.room.vibe;

    } catch (err) {
        console.error('Error fetching room info:', err);
        showPopup("Server unreachable", "error");
    }
}

// HIDE SHOW ROOM CODE
const hideShowCodeBtn = document.getElementById("hide/show-code");

hideShowCodeBtn?.addEventListener('click', () => {
    if (roomCode.classList.contains("blur-md")) {
        roomCode.classList.remove("blur-md");
        hideShowCodeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;

    } else {
        roomCode.classList.add("blur-md");
        hideShowCodeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off-icon lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>`
    }
});

// TODO[X]: SHOW SETTING BTN

const settingBtn = document.getElementById('setting-btn');
const settingContent = document.getElementById('setting-content');

const queueBtn = document.getElementById('queue-btn');
const chatBtn = document.getElementById('chat-btn');

const queueContent = document.getElementById('queue-content');
const chatContent = document.getElementById('chat-content');

const underline = document.getElementById('underline');

settingBtn?.addEventListener('click', () => {
    settingContent.classList.remove('hidden');
    chatContent.classList.add('hidden');
    queueContent.classList.add('hidden');
    underline.classList.add('hidden');
});


// TODO[]: Fetch listener count

// TODO[X]: Implement leave room button redirect to main page
const leaveRoomBtn = document.getElementById('leave-room-btn');
leaveRoomBtn?.addEventListener('click', async () => {

    const params = new URLSearchParams(window.location.search);
    const room_id = params.get('room_id');

    const user = await fetchUser();

    socket.emit('leave_room', { room_id, user_id: user.id });

    window.location.href = '../Main/main.html';
});



queueBtn.addEventListener('click', () => {
    queueContent.classList.remove('hidden');
    settingContent.classList.add('hidden');
    chatContent.classList.add('hidden');
    underline.classList.remove('hidden');
    underline.style.left = '0%';
});

chatBtn.addEventListener('click', () => {
    chatContent.classList.remove('hidden');
    settingContent.classList.add('hidden');
    queueContent.classList.add('hidden');
    underline.classList.remove('hidden');
    underline.style.left = '50%';
});

// TODO[X]: Implement search for song in queue
const roomSearchInput = document.getElementById("search-input");
const roomSearchResults = document.getElementById("search-results-container");
const addToQueueBtn = document.getElementById("add-to-queue-btn");
addToQueueBtn?.addEventListener('click', () => {
    roomSearchInput.value = "";
    roomSearchResults.innerHTML = "";
    const searchBarContainer = document.getElementById("search-bar-container");
    if(searchBarContainer.classList.contains("hidden")) {
        searchBarContainer.classList.remove("hidden");
        roomSearchInput.classList.remove('hidden');
    } else {
        searchBarContainer.classList.add("hidden");
        roomSearchInput.classList.add('hidden');
    }
});

const STATIC_URL = 'http://localhost:5001';

// Format audio duration
function formatTime(duration) {
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Display search results
function displayRoomSearchResults(songs) {
    roomSearchResults.innerHTML = '';

    if (!songs || songs.length === 0) {
        roomSearchResults.innerHTML = `<div class="text-white/70">No songs found.</div>`;
        return;
    }

    songs.forEach(song => {
        const div = document.createElement('div');
        div.className = `
            music-container relative flex items-center gap-3 p-2 bg-white/10 backdrop-blur-lg rounded-xl cursor-pointer
            hover:bg-white/20 transition duration-300 group
        `;

        div.innerHTML = `
            <img src="${STATIC_URL}${song.cover_image_path}" alt="Cover"
                 style="width:50px;height:50px;object-fit:cover;"
                 class="rounded-md transition duration-300 group-hover:blur-sm group-hover:brightness-50"/>
            <div class="flex-1 text-white overflow-hidden">
                <div class="font-medium text-sm truncate">${song.title}</div>
                <div class="font-light text-xs truncate">${song.artist}</div>
            </div>
            <div class="text-white font-light text-xs duration-display group-hover:blur-sm group-hover:opacity-50"></div>
        `;

        // Load audio to get duration
        const audioTemp = new Audio(`${STATIC_URL}${song.audio_file_path}`);
        const durationEl = div.querySelector('.duration-display');
        audioTemp.addEventListener('loadedmetadata', () => {
            durationEl.textContent = formatTime(audioTemp.duration);
        });

        // Click to add to queue or play
        div.addEventListener('click', async () => {
            try {
                await AddToQueue(song.id);
                roomSearchInput.value = "";
                roomSearchResults.innerHTML = "";
                roomSearchInput.classList.add('hidden');
            } catch (err) {
                console.error(err);
                showPopup("Failed to add song to queue", "error");
            }
        });

        roomSearchResults.appendChild(div);
    });
}

// ----------------------- SOCKET EVENTS -----------------------

// queue update
socket.on('queue_update', (data) => {
    const params = new URLSearchParams(window.location.search);
    const room_id = params.get('room_id');
    if (data.room_id.toString() === room_id) {
        renderQueue();
    }
});

// current song update
socket.on('current_song_update', (data) => {
    const params = new URLSearchParams(window.location.search);
    const room_id = params.get('room_id');
    if (data.room_id.toString() === room_id) {
        renderCurrentSong();
    }
});

// playback status update
socket.on('toggle_play', (data) => {
    const params = new URLSearchParams(window.location.search);
    const room_id = params.get('room_id');

    if (data.room_id.toString() !== room_id) return;

    isPlaying = data.is_playing;

    if (isPlaying) {
        currentAudio.play();
    } else {
        currentAudio.pause();
    }

    updatePlayPauseIcon();
});


// Fetch search results on input
roomSearchInput.addEventListener("input", async () => {
    const query = roomSearchInput.value.trim();
    if (!query) {
        roomSearchResults.innerHTML = "";
        return;
    }

    try {
        const res = await fetch(
            `${BACKEND_URL}/musics/search?q=${encodeURIComponent(query)}`
        );
        if (!res.ok) {
            throw new Error('Search request failed');
        }

        const data = await res.json();
        displayRoomSearchResults(data.songs);
    } catch (err) {
        console.error("Search failed:", err);
        roomSearchResults.innerHTML = `<div class="text-white/70">Search failed. Try again.</div>`;
    }
});



// TODO[X]: Implement Add to Queue
async function AddToQueue(song_id) {
    const params = new URLSearchParams(window.location.search);
    const room_id = params.get('room_id');
    const token = localStorage.getItem('accessToken');

    try {
        const res = await fetch(`${BACKEND_URL}/rooms/addToQueue/${room_id}/${song_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        console.log("→ add to queue response:", data);

        if (!res.ok) {
            console.error("→ Error adding song to queue:", data.message);
            showPopup("Failed to add song to queue", "error");
            return;
        }

        showPopup("Song added to queue!", "success");

    } catch (err) {
        console.error(err);
        showPopup("Failed to add song to queue", "error");
    }
}


const queueContainer = document.getElementById('queue-music-container');

let currentQueue = [];
let currentSongIndex = -1;

export async function renderQueue() {
    const params = new URLSearchParams(window.location.search);
    const room_id = params.get('room_id');
    const token = localStorage.getItem('accessToken');

    console.log("renderQueue called");

    try {
        const res = await fetch(`${BACKEND_URL}/rooms/get_room_queue/${room_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("→ Error fetching room queue:", data.message);
            showPopup("Failed to fetch room queue", "error");
            return;
        }

        if (!data.queue || data.queue.length === 0) {
            queueContainer.innerHTML = `<div class="text-white/70">Queue is empty.</div>`;
            currentQueue = [];
            currentSongIndex = -1;
            return;
        }

        // Store queue for autoplay
        currentQueue = data.queue;

        // Fetch current song to set index
        const resCurrent = await fetch(`${BACKEND_URL}/rooms/get_current_song/${room_id}`);
        const dataCurrent = await resCurrent.json();
        if (dataCurrent.current_song) {
            currentSongIndex = currentQueue.indexOf(dataCurrent.current_song.id);
        } else {
            currentSongIndex = -1;
        }

        queueContainer.innerHTML = ''; // clear container first

        for (const songId of currentQueue) {
            try {
                const songRes = await fetch(`${BACKEND_URL}/musics/get_song/${songId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const songData = await songRes.json();

                // Get duration
                const audioTemp = new Audio(`${STATIC_URL}${songData.song.audio_file_path}`);
                await new Promise((resolve) => audioTemp.addEventListener('loadedmetadata', resolve));
                songData.song.duration = audioTemp.duration;

                // Create song element
                const songDiv = document.createElement('div');
                songDiv.className = `
                    music-container relative flex items-center gap-3 p-2 bg-white/10 backdrop-blur-lg rounded-xl cursor-pointer
                    hover:bg-white/20 transition duration-300
                `;
                songDiv.innerHTML = `
                    <img src="${STATIC_URL}${songData.song.cover_image_path}" alt="Cover"
                        style="width:50px;height:50px;object-fit:cover;"
                        class="rounded-md"/>
                    <div class="flex-1 text-white overflow-hidden">
                        <div class="font-medium text-sm truncate">${songData.song.title}</div>
                        <div class="font-light text-xs truncate">${songData.song.artist}</div>
                    </div>
                    <div class="text-white font-light text-xs">${formatTime(songData.song.duration)}</div>
                `;

                // Click to set as current song
                songDiv.addEventListener('click', async () => {
                    currentSongIndex = currentQueue.indexOf(songData.song.id);
                    await setCurrentSong(songData.song.id);

                    const isPlayingRes = await fetch(`${BACKEND_URL}/rooms/get_room/${room_id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const isPlayingData = await isPlayingRes.json();
                    isPlaying = isPlayingData.is_playing;




                    await fetch(`${BACKEND_URL}/rooms/set_is_playing/${room_id}/${!isPlaying}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                });

                queueContainer.appendChild(songDiv);

            } catch (err) {
                console.error("→ Error fetching song details:", err);
            }
        }

    } catch (err) {
        console.error('Error fetching room queue:', err);
        showPopup("Server unreachable", "error");
    }
}

// TODO[X]: Implement Show Music name
// TODO[X]: Implement Show Music artist
const currentSongCover = document.getElementById('current-song-cover');
const currentSongTitle = document.getElementById('current-song-title');
const currentSongArtist = document.getElementById('current-song-artist');

const playPauseBtn = document.getElementById('play-pause-btn');

const seekBar = document.getElementById('seekBar');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');

let currentAudio = new Audio();
let isPlaying = true;

export async function renderCurrentSong(forcePlay = false) {
    const params = new URLSearchParams(window.location.search);
    const room_id = params.get('room_id');
    const token = localStorage.getItem('accessToken');

    try {
        const res = await fetch(`${BACKEND_URL}/rooms/get_current_song/${room_id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();

        if (!data.current_song) {
            currentSongCover.src = '../../assets/placeholder_music_cover.png';
            currentSongTitle.textContent = "Music Title";
            currentSongArtist.textContent = "Artist Name";
            isPlaying = false;
            updatePlayPauseIcon();
            return;
        }

        const song = data.current_song;

        // Update UI
        currentSongCover.src = `${STATIC_URL}${song.cover_image_path}`;
        currentSongTitle.textContent = song.title;
        currentSongArtist.textContent = song.artist;

        // Load song
        currentAudio.src = `${STATIC_URL}${song.audio_file_path}`;
        currentAudio.load();

        currentAudio.onloadedmetadata = () => {
            seekBar.max = currentAudio.duration;
            totalDurationEl.textContent = formatTime(currentAudio.duration);
        };

        currentAudio.ontimeupdate = () => {
            seekBar.value = currentAudio.currentTime;
            currentTimeEl.textContent = formatTime(currentAudio.currentTime);
        };

        currentAudio.onended = async () => {
            if (currentQueue.length === 0) return;
            currentSongIndex++;
            if (currentSongIndex >= currentQueue.length) currentSongIndex = 0;
            const nextSongId = currentQueue[currentSongIndex];
            await setCurrentSong(nextSongId);
        };

        isPlaying = forcePlay ? true : data.is_playing;
        updatePlayPauseIcon();

        if (isPlaying) {
            currentAudio.play().catch(() => {
                console.warn("Autoplay blocked by browser");
                isPlaying = false;
                updatePlayPauseIcon();
            });
        }

    } catch (err) {
        console.error("Failed to fetch current song:", err);
    }
}


playPauseBtn.addEventListener('click', async () => {
    if (!currentAudio.src) return;

    isPlaying = !isPlaying;

    if (isPlaying) {
        currentAudio.play();
    } else {
        currentAudio.pause();
    }

    // Sync with backend
    const params = new URLSearchParams(window.location.search);
    const room_id = params.get('room_id');


    const token = localStorage.getItem('accessToken');
    await fetch(`${BACKEND_URL}/rooms/set_is_playing/${room_id}/${isPlaying}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });

});


seekBar.addEventListener('input', () => {
    currentAudio.currentTime = seekBar.value;
});

async function setCurrentSong(songId) {
    const params = new URLSearchParams(window.location.search);
    const room_id = params.get('room_id');
    const token = localStorage.getItem('accessToken');

    // Tell backend this is the current song
    await fetch(`${BACKEND_URL}/rooms/set_current_song/${room_id}/${songId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    // Immediately set frontend state to playing
    isPlaying = true;
    updatePlayPauseIcon();

    // Update UI with new song
    await renderCurrentSong(true);

    // Try to play
    currentAudio.play().catch(() => {
        console.warn("Autoplay blocked by browser");
        isPlaying = false;
        updatePlayPauseIcon();
    });

    // Sync backend state
    await fetch(`${BACKEND_URL}/rooms/set_is_playing/${room_id}/true`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}



// Update play/pause icon
function updatePlayPauseIcon() {
    playPauseBtn.innerHTML = isPlaying ? `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             class="lucide lucide-pause text-black">
          <rect x="6" y="4" width="4" height="16" rx="1"/>
          <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>` :
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round text-black"
             class="lucide lucide-circle-play text-black">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="10 8 16 12 10 16 10 8"/>
        </svg>`;
}

// TODO[X]: Implement previous song functionality synchronization
// TODO[X]: Implement skip song functionality synchronization

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

nextBtn.addEventListener('click', async () => {
    if (currentQueue.length === 0) return;

    currentSongIndex = (currentSongIndex + 1) % currentQueue.length;
    const nextSongId = currentQueue[currentSongIndex];

    await setCurrentSong(nextSongId);
});

prevBtn.addEventListener('click', async () => {
    if (currentQueue.length === 0) return;

    currentSongIndex = (currentSongIndex - 1 + currentQueue.length) % currentQueue.length;
    const prevSongId = currentQueue[currentSongIndex];

    await setCurrentSong(prevSongId);
});


// TODO[]: Implement play song not synchronization
// TODO[]: Implement pause song not synchronization
// TODO[]: Implement song progress bar synchronization

// TODO[]: Implement sending chat message
// TODO[]: Implement Setting Private Room

// TODO[X]: Implement Change Room Vibe/Name
// make change room btn click able only when there is a change in input fields
// INITIAL button state
const changeRoomBtn = document.getElementById('name/vibe-change-btn');
changeRoomBtn.disabled = true;
changeRoomBtn.classList.add('opacity-30', 'cursor-not-allowed');

function toggleUpdateButton() {
    const changed =
        ChangeRoomNameInput.value !== roomName.textContent ||
        ChangeRoomVibeInput.value !== roomVibe.textContent;

    if (changed) {
        changeRoomBtn.disabled = false;
        changeRoomBtn.classList.remove('opacity-30', 'cursor-not-allowed');
        changeRoomBtn.classList.add(
            'cursor-pointer', 'hover:bg-gradient-to-br',
            'hover:from-blue-800', 'hover:to-purple-800'
        );
    } else {
        changeRoomBtn.disabled = true;
        changeRoomBtn.classList.add('opacity-30', 'cursor-not-allowed');
        changeRoomBtn.classList.remove(
            'cursor-pointer', 'hover:bg-gradient-to-br',
            'hover:from-blue-800', 'hover:to-purple-800'
        );
    }
}

// trigger when either value changes
ChangeRoomNameInput.addEventListener('input', toggleUpdateButton);
ChangeRoomVibeInput.addEventListener('input', toggleUpdateButton);

// ======================
// UPDATE API REQUEST
// ======================
async function updateRoomInfo() {
    const params = new URLSearchParams(window.location.search);
    const room_id = params.get('room_id');
    const token = localStorage.getItem(`roomToken_${room_id}`)

    const newRoomName = ChangeRoomNameInput.value.trim();
    const newRoomVibe = ChangeRoomVibeInput.value.trim();

    try {
        const res = await fetch(`${BACKEND_URL}/rooms/update_room/${room_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: newRoomName,
                vibe: newRoomVibe
            })
        });

        const data = await res.json();
        console.log("→ update response:", data);

        if (!res.ok) {
            console.error("→ Error fetching room info:", data.message);
            showPopup("You cannot access this room.", "error");
            window.location.href = '../Main/main.html';
            return;
        }

        // UPDATE UI
        roomName.textContent = data.room.title;
        roomVibe.textContent = data.room.vibe;

        ChangeRoomNameInput.value = data.room.title;
        ChangeRoomVibeInput.value = data.room.vibe;

        changeRoomBtn.disabled = true;
        changeRoomBtn.classList.add('opacity-30', 'cursor-not-allowed');
        changeRoomBtn.classList.remove('cursor-pointer');

        showPopup("Room updated successfully!", "success");

    } catch (err) {
        console.error(err);
        showPopup("Server unreachable", "error");
    }
}

changeRoomBtn.addEventListener("click", updateRoomInfo);

// TODO[X]: Implement Delete Room
// Delete USER ACCOUNT
const deleteRoomBtn = document.getElementById("delete-room-btn");
const deleteRoomConfirmation = document.getElementById("delete_room_confirmation");
const deleteRoomOverlay = document.getElementById("delete_room_overlay");
const confirmDeleteRoomBtn = document.getElementById("confirm_delete_room_btn");
const cancelDeleteRoomBtn = document.getElementById("cancel_delete_room_btn");
deleteRoomBtn?.addEventListener('click', () => {
    deleteRoomConfirmation.classList.remove("hidden");
    deleteRoomOverlay.classList.remove("hidden");
});

cancelDeleteRoomBtn?.addEventListener('click', () => {
    deleteRoomConfirmation.classList.add("hidden");
    deleteRoomOverlay.classList.add("hidden");
});

async function deleteRoom() {
    const params = new URLSearchParams(window.location.search);
    const room_id = params.get('room_id');
    const accessToken = localStorage.getItem('accessToken');

    try {
        const res = await fetch(`${BACKEND_URL}/rooms/delete_room/${room_id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const data = await res.json();
        console.log("→ delete response:", data);

        if (!res.ok) {
            console.error("→ Error fetching room info:", data.message);
            showPopup("You cannot access this room.", "error");
            window.location.href = '../Main/main.html';
            return;
        }

        showPopup("Room deleted successfully!", "success");
        // Redirect or update UI as needed after deletion
        window.location.href = "../Main/main.html"; // Redirect to home or another appropriate page

    } catch (err) {
        console.error(err);
        showPopup("Server unreachable", "error");
    }
}

async function fetchUser() {
    const accessToken = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`${BACKEND_URL}/utils/get_user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const data = await res.json();
        console.log("→ user data:", data);

        if (!res.ok) {
            console.error("→ Error fetching user info:", data.message);
            return null;
        }

        return data.user;

    } catch (err) {
        console.error(err);
        return null;
    }

}

confirmDeleteRoomBtn?.addEventListener('click', deleteRoom);
// TODO[]: Implement Kick Listener
// TODO[]: Implement Ban Listener
// TODO[]: Implement MAX Listener Count
