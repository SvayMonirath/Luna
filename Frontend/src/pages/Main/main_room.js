const BACKEND_URL = 'http://localhost:5001/';
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


// ------------------ Handle Room Pop-up ------------------
const createRoomModal = document.getElementById('create-room-modal');
const closeCreateRoomModalBtn = document.getElementById('close-create-room-modal');


document.querySelectorAll('.open-create-room-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        createRoomModal.classList.remove('hidden');
    });
});

closeCreateRoomModalBtn?.addEventListener('click', () => {
    createRoomModal.classList.add('hidden');
});

// ------------------ Handle Input in Create Room ------------------
const roomNameInput = document.getElementById('room-name-input');
const roomVibeBtns = document.querySelectorAll('#choose-vibe button');
const roomPasswordInput = document.getElementById('room-password-input');

const previewName = document.getElementById('preview-room-name');
const previewVibe = document.getElementById('preview-room-vibe');
const previewPrivacy = document.getElementById('preview-room-privacy');

// Update preview name
roomNameInput.addEventListener('input', () => {
    previewName.textContent = roomNameInput.value || 'Untitled room';
    updateCreateRoomButton();
});

// Update preview vibe & highlight
roomVibeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove previous selection
        roomVibeBtns.forEach(b => b.classList.remove('selected-vibe'));
        // Add selected class
        btn.classList.add('selected-vibe');
        // Update preview
        previewVibe.textContent = btn.textContent;
    });
});

// Update preview privacy
roomPasswordInput.addEventListener('input', () => {
    previewPrivacy.textContent = roomPasswordInput.value.trim() === '' ? 'Public' : 'Private';
});

// ------------------ Create Room Submission ------------------
async function createRoom() {
    const token = localStorage.getItem('accessToken');
    const name = roomNameInput.value.trim();
    const vibe = document.querySelector('#choose-vibe button.bg-purple-600')?.textContent || 'Gaming';
    const password = roomPasswordInput.value;

    const body = {
        name: name,
        vibe: vibe,
        is_private: password.trim() !== '',
        password: password || null
    };

    console.log("Sending body:", body);  // <--- see what you send

    try {
        const res = await fetch(`${BACKEND_URL}api/v1/rooms/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        console.log("Response from backend:", data);  // <--- see real error

        if (!res.ok) {
            alert(data.message || JSON.stringify(data));
        } else {
            createRoomModal.classList.add('hidden');
            window.location.reload();
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}


// ------------------ Handle Create Room Button ------------------
const createRoomBtnDiv = document.getElementById('create-room-button');

function updateCreateRoomButton() {
    const nameEmpty = roomNameInput.value.trim() === '';

    if (nameEmpty) {
        // Disabled button
        createRoomBtnDiv.innerHTML = `
        <div class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-50 rounded-xl px-4 py-3 text-white font-semibold flex justify-center items-center gap-2 transition cursor-not-allowed">
            <span>Create room</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right-icon lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>`;
    } else {
        // Active button
        createRoomBtnDiv.innerHTML = `
        <button id="createRoomBtn" class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl px-4 py-3 text-white font-semibold flex justify-center items-center gap-2 transition">
            <span>Create room</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right-icon lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>`;

        // Attach click listener
        const createRoomBtn = document.getElementById('createRoomBtn');
        createRoomBtn.addEventListener('click', createRoom);
    }
}

// Initialize button
updateCreateRoomButton();

// ------------------ Room Cards ------------------
function createRoomCard(room) {
    const roomDiv = document.createElement('div');
    roomDiv.className = 'relative bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-lg p-4 text-white mb-4 cursor-pointer border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.05]';

    roomDiv.innerHTML = `
        <h3 class="text-xl mb-2">${room.title}</h3>
        <p class="text-white px-3 py-1.5 mb-2 inline-flex items-center bg-purple-600/20 border border-purple-500/30 rounded-full">${room.vibe || "N/A"}</p>
    `;

    if (room.is_private) {
        roomDiv.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-2 right-2 lucide lucide-lock-icon lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    }

    const privateRoomOverlay = document.getElementById('private_room_overlay');
    const privateRoomPwdConfirmation = document.getElementById('private_room_pwd_confirmation');
    const privateRoomPasswordInput = document.getElementById('private_room_password_input');
    const privateRoomPasswordSubmitBtn = document.getElementById('private_room_password_submit_btn');
    const privateRoomPasswordCancelBtn = document.getElementById('private_room_password_cancel_btn');

    function closePrivateRoomModal() {
        privateRoomPwdConfirmation.classList.add('hidden');
        privateRoomOverlay.classList.add('hidden');
        privateRoomPasswordInput.value = '';
    }

    privateRoomPasswordCancelBtn?.addEventListener('click', () => {
        closePrivateRoomModal();
    });

    const roomToken = localStorage.getItem(`roomToken_${room.id}`);

    privateRoomPasswordSubmitBtn?.addEventListener('click', async () => {
        const enteredPassword = privateRoomPasswordInput.value;

        try {
            const res = await fetch(`${BACKEND_URL}api/v1/rooms/check_room_password/${room.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    room_id: room.id,
                    password: enteredPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                showPopup(data.message || 'Incorrect password', 'error');
            } else if (data.access) {
                localStorage.setItem(`roomToken_${room.id}`, data.room_token);
                window.location.href = `../room/room.html?room_id=${room.id}`;
            }

    }
        catch (err) {
            console.error("Error checking room password:", err);
        }
    });

    roomDiv.addEventListener('click', () => {

        if (room.is_private && !roomToken) {
            privateRoomOverlay.classList.remove('hidden');
            privateRoomPwdConfirmation.classList.remove('hidden');

        } else if(room.is_private && roomToken) {
            window.location.href = `../room/room.html?room_id=${room.id}`;
        } else {
            window.location.href = `../room/room.html?room_id=${room.id}`;
        }

    });

    return roomDiv;
}


const roomsContainer = document.getElementById('rooms-container');
// ------------------ Load Rooms ------------------
export async function loadRooms() {
    const token = localStorage.getItem('accessToken');
    if (!token) return console.error("No access token found");

    try {
        const res = await fetch(`${BACKEND_URL}api/v1/rooms/get_all_owned_rooms`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Failed to load rooms");
            return;
        }

        if (!data.rooms || data.rooms.length === 0) {
            roomsContainer.innerHTML = '<p class="text-white font-medium">No rooms available.</p>';
            return;
        }

        roomsContainer.innerHTML = '';
        data.rooms.forEach(room => {
            const roomCard = createRoomCard(room);
            roomsContainer.appendChild(roomCard);
        });
    } catch (err) {
        console.error("Error loading rooms:", err);
    }
}
