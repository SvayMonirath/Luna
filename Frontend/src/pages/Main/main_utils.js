const BACKEND_URL = 'http://localhost:5001/';
let audio = new Audio();
let currentSongPath = null;

// ------------------- SEARCH FUNCTIONALITY -------------------
const searchInput = document.getElementById("search");
const searchResults = document.getElementById("searchResults");

searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  if (!query) {
    searchResults.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}api/v1/musics/search?q=${encodeURIComponent(query)}`
    );
    const data = await res.json();

    displaySearchResults(data.songs);
  } catch (err) {
    console.error("Search failed:", err);
  }
});

function displaySearchResults(songs) {
    searchResults.innerHTML = '';

    if (songs.length === 0) {
        searchResults.innerHTML = `<div class="text-white/70">No songs found.</div>`;
        return;
    }

    songs.forEach(song => {
        const div = document.createElement('div');
        div.className = `
            music-container relative flex items-center gap-3 p-2 bg-white/10 backdrop-blur-lg rounded-xl cursor-pointer
            hover:bg-white/20 transition duration-300 group
        `;

        div.innerHTML = `
            <!-- Cover -->
            <img src="${BACKEND_URL}${song.cover_image_path}"
                style="width:50px;height:50px;object-fit:cover;" class="rounded-md transition duration-300 group-hover:blur-sm group-hover:brightness-50"/>

            <!-- Text -->
            <div class="flex-1 text-white overflow-hidden">
                <div class="font-medium text-sm truncate">${song.title}</div>
                <div class="font-light text-xs truncate">${song.artist}</div>
            </div>

            <!-- Duration -->
            <div class="text-white font-light text-xs duration-display group-hover:blur-sm group-hover:opacity-50"></div>
        `;

        // Load audio to get duration
        const audioTemp = new Audio(`${BACKEND_URL}${song.audio_file_path}`);
        const durationEl = div.querySelector('.duration-display');
        audioTemp.addEventListener('loadedmetadata', () => {
            durationEl.textContent = formatTime(audioTemp.duration);
        });

        // Click to play song
        div.addEventListener('click', () => {
            document.getElementById("player-title").textContent = song.title;
            document.getElementById("player-artist").textContent = song.artist;
            document.getElementById("player-cover").src = `${BACKEND_URL}${song.cover_image_path}`;
            document.getElementById("player-bar").classList.remove("hidden");

            playSong(song.audio_file_path);
        });

        searchResults.appendChild(div);
    });
}
// ------------------- MOBILE SEARCH FUNCTIONALITY -------------------

const mobileSearchInput = document.getElementById("mobileSearch");
const mobileSearchResults = document.getElementById("mobileSearchResults");

mobileSearchInput.addEventListener("input", async () => {
  const query = mobileSearchInput.value.trim();
  if (!query) {
    mobileSearchResults.innerHTML = "";
    mobileSearchResults.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}api/v1/musics/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    displayMobileResults(data.songs);
  } catch (err) {
    console.error("Mobile search failed:", err);
  }
});

function displayMobileResults(songs) {
  mobileSearchResults.innerHTML = '';

  if (!songs || songs.length === 0) {
    mobileSearchResults.innerHTML = `<div class="text-white/70 p-2">No songs found.</div>`;
    mobileSearchResults.classList.remove("hidden");
    return;
  }

  songs.forEach(song => {
    const div = document.createElement('div');
    div.className = "flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer transition";
    div.innerHTML = `
      <img src="${BACKEND_URL}${song.cover_image_path}" class="w-10 h-10 rounded-md object-cover"/>
      <div class="flex-1 text-white overflow-hidden">
        <div class="font-medium text-sm truncate">${song.title}</div>
        <div class="font-light text-xs truncate">${song.artist}</div>
      </div>
    `;
    div.addEventListener('click', () => {
      // Play song logic
      playSong(song.audio_file_path);
    });
    mobileSearchResults.appendChild(div);
  });

  mobileSearchResults.classList.remove("hidden");
}


// ------------------- PLAY SONG & PLAYER BAR -------------------

function playSong(path) {
    if (!path) return;

    const fullPath = `${BACKEND_URL}${path}`;
    const playPauseBtn = document.getElementById("playPauseBtn");
    const seekBar = document.getElementById("seekBar");

    // Toggle play/pause if same song
    if (currentSongPath === fullPath) {
        if (audio.paused) {
            audio.play();
            playPauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause-icon lucide-pause"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg>`;
        } else {
            audio.pause();
            playPauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>`;
        }
        return;
    }

    // Pause current song if any
    if (!audio.paused) audio.pause();

    // Load new song
    audio = new Audio(fullPath);
    currentSongPath = fullPath;

    // Play new song
    audio.play();
    playPauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause-icon lucide-pause"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg>`;

    // Update seek bar as song plays
    audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
            seekBar.max = audio.duration;
            seekBar.value = audio.currentTime;

            currentTime.textContent = formatTime(audio.currentTime);
            duration.textContent = formatTime(audio.duration);
        }
    });

    // Show player bar if hidden
    const playerBar = document.getElementById("player-bar");
    if (playerBar.classList.contains("hidden")) playerBar.classList.remove("hidden");
}

// ------------------- SEEK BAR & PLAY/PAUSE BUTTON -------------------
const playPauseBtn = document.getElementById("playPauseBtn");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const seekBar = document.getElementById("seekBar");


playPauseBtn?.addEventListener("click", () => {
    if (!audio.src) return;

    if (audio.paused) {
        audio.play();
        playPauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause-icon lucide-pause"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg>`;
    } else {
        audio.pause();
        playPauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>`;
    }
});

// Allow seeking
seekBar?.addEventListener("input", () => {
    if (audio.src) audio.currentTime = seekBar.value;
});

// ------------------- VOLUMNE  -------------------
const volumeSlider = document.getElementById("volume");
const volumeIcon = document.getElementById("volumeIcon");

volumeSlider?.addEventListener("input", () => {
    const vol = volumeSlider.value / 100;
    audio.volume = vol;

    if (vol === 0) {
        volumeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-icon lucide-volume"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/></svg>`;
    } else if (vol <= 0.5) {
        volumeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume1-icon lucide-volume-1"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/></svg>`;
    } else {
        volumeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2-icon lucide-volume-2"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>`;
    }
});

// ------------------- DISPLAY SONGS HEADER -------------------
function displaySongsHeader(songs) {
    const container = document.getElementById('song-container');
    container.innerHTML = '';

    songs.forEach(song => {
        const songDiv = document.createElement('div');
        songDiv.className = "music-container relative flex flex-col items-center gap-4 p-3 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition duration-300 group overflow-hidden shadow-lg ";


        songDiv.innerHTML = `
            <!-- Cover + Text -->
            <div class="flex flex-row gap-4 items-center w-full">
                <!-- Cover -->
                <img src="${BACKEND_URL}${song.cover_image_path}"
                    style="width: 90px; height: 90px; object-fit: cover;"
                    class="rounded-md transition duration-300 group-hover:blur-sm group-hover:brightness-50" />

                <!-- Text -->
                <div class="mt-2 text-start transition duration-300 group-hover:blur-sm group-hover:opacity-40">
                    <div class="text-white font-medium text-xl md:text-2xl">${song.title}</div>
                    <div class="text-white font-extralight text-sm md:text-base">${song.artist}</div>
                </div>
            </div>

            <!-- PLAY ICON (hidden until hover) -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg"
                    width="70" height="70" fill="white"
                    viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </div>
        `;

        songDiv.addEventListener('click', () => {
            // Show player bar
            const bar = document.getElementById("player-bar");
            bar.classList.remove("hidden");

            // Update title and artist
            document.getElementById("player-title").textContent = song.title;
            document.getElementById("player-artist").textContent = song.artist;
            document.getElementById("player-cover").src = `${BACKEND_URL}${song.cover_image_path}`;

            // Start playing
            playSong(song.audio_file_path);
        });

        container.appendChild(songDiv);
    });
}

// ------------------- DISPLAY TRENDING -------------------
function displayTrending(songs) {
  const container = document.getElementById("trendingMusic");
  container.innerHTML = "";
  if(songs.length === 0) {
    container.innerHTML = `<div class="text-white/70">No trending songs available.</div>`;
    return;
  }

songs.forEach((song) => {
    const songDiv = document.createElement("div");
    const audio = new Audio(`${BACKEND_URL}${song.audio_file_path}`);

    songDiv.className =
    //  i want glass like background
      "music-container relative flex flex-col items-center gap-4 p-1  bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 backdrop-blur-lg px-4 rounded-2xl cursor-pointer hover:bg-gradient-to-br hover:from-slate-800/60 hover:to-slate-900/60 transition duration-300 group overflow-hidden shadow-lg";

    // Create inner HTML with a placeholder for duration
    songDiv.innerHTML = `
        <div class="flex flex-row gap-7 items-center w-full">
            <img src="${BACKEND_URL}${song.cover_image_path}"
                style="width: 50px; height: 50px; object-fit: cover;"
                class="rounded-md transition duration-300 group-hover:blur-sm group-hover:brightness-50" />
            <div class="mt-2 text-start transition duration-300 group-hover:blur-sm group-hover:opacity-40 ">
                <div class="text-white font-medium text-lg">${song.title}</div>
                <div class="text-white font-extralight text-xs md:text-base">${song.artist}</div>
            </div>
            <!--  i want duration to be add the end of the div -->
            <div class="flex flex-auto justify-end mt-2 text-white font-light text-lg duration-display group-hover:blur-sm group-hover:opacity-40"></div>
        </div>

        <!-- PLAY ICON (hidden until hover) -->
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg"
                width="50" height="50" fill="white"
                viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
            </svg>
        </div>
    `;

    // Update duration when metadata is loaded
    const durationDisplay = songDiv.querySelector(".duration-display");
    audio.addEventListener("loadedmetadata", () => {
        durationDisplay.textContent = formatTime(audio.duration);
    });

    songDiv.addEventListener("click", () => {
        const bar = document.getElementById("player-bar");
        bar.classList.remove("hidden");

        document.getElementById("player-title").textContent = song.title;
        document.getElementById("player-artist").textContent = song.artist;
        document.getElementById("player-cover").src = `${BACKEND_URL}${song.cover_image_path}`;

        playSong(song.audio_file_path);
    });

    container.appendChild(songDiv);
});
}

// ------------------- LOAD SONGS -------------------
async function loadSongsHeader() {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${BACKEND_URL}api/v1/musics/get_random/4`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
        console.error("Failed to load songs");
        return;
    }

    const data = await res.json();
    displaySongsHeader(data.songs);
}

// ------------------- LOAD TRENDING -------------------
async function loadTrendingSongs() {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${BACKEND_URL}api/v1/musics/get_random/6`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
        console.error("Failed to load songs");
        return;
    }

    const data = await res.json();
    displayTrending(data.songs);
}

// ------------------- FETCH USER -------------------
async function fetchUser() {
    const usernameEL = document.getElementById('usernameDisplay');
    const token = localStorage.getItem('accessToken');

    if (!token) {
        usernameEL.textContent = 'Guest';
        return;
    }

    const res = await fetch(`${BACKEND_URL}api/v1/utils/get_user`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        usernameEL.textContent = 'Guest';
        return;
    }

    const user = await res.json();
    usernameEL.textContent = user.username;
}


// ------------------ ASIDE Shortcut ------------------

// Your Rooms Shortcut
const yourRoomsBtn = document.getElementById('your-rooms-shortcut');
const roomsContainer = document.getElementById('rooms-container');
yourRoomsBtn.addEventListener('click', () => {
    window.scrollTo({
        top: roomsContainer.offsetTop - 120,
        behavior: 'smooth'
    });
});

// Join Room Shortcut
const joinRoomBtn = document.getElementById('join-room-shortcut');
const joinedRoomsContainer = document.getElementById('joined-rooms-container');
joinRoomBtn.addEventListener('click', () => {
    window.scrollTo({
        top: joinedRoomsContainer.offsetTop - 110,
        behavior: 'smooth'
    });
});

const trendingMusicBtn = document.getElementById('trending-music-shortcut');
const trendingMusicContainer = document.getElementById('trendingMusic');
trendingMusicBtn.addEventListener('click', () => {
    window.scrollTo({
        top: trendingMusicContainer.offsetTop - 100,
        behavior: 'smooth'
    });
});

const playlistBtn = document.getElementById('playlist-shortcut');
const playlistContainer = document.getElementById('playlist-container');
playlistBtn.addEventListener('click', () => {
    window.scrollTo({
        top: playlistContainer.offsetTop - 100,
        behavior: 'smooth'
    });
});


// ------------------- HELPER -------------------
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
}

// ------------------- EXPORT -------------------
export { loadSongsHeader, loadTrendingSongs , fetchUser };
