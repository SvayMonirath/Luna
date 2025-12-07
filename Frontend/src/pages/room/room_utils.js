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
leaveRoomBtn?.addEventListener('click', () => {
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



// TODO[]: Implement Show Music name
// TODO[]: Implement Show Music artist
// TODO[]: Implement Add to Queue
// TODO[]: Implement play song synchronization
// TODO[]: Implement pause song synchronization
// TODO[]: Implement previous song functionality synchronization
// TODO[]: Implement skip song functionality synchronization
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
    const token = localStorage.getItem(`roomToken_${room_id}`)

    try {
        const res = await fetch(`${BACKEND_URL}/rooms/delete_room/${room_id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
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

confirmDeleteRoomBtn?.addEventListener('click', deleteRoom);
// TODO[]: Implement Kick Listener
// TODO[]: Implement Ban Listener
// TODO[]: Implement MAX Listener Count
