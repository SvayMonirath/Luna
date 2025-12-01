const BACKEND_URL = 'http://localhost:5001/api/v1';

const username = document.getElementById("User-name");
const email = document.getElementById("User-email");
const updateUsernameInput = document.getElementById("update-username-input");
const updateEmailInput = document.getElementById("update-email-input");

async function fetchUser() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        console.error('No access token found. Redirecting to login.');
        return;
    }

    try {
        const res = await fetch(`${BACKEND_URL}/utils/get_user`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
            throw new Error('Failed to fetch user data');
        } else {
            const data = await res.json();
            username.textContent = `@${data.username}`;
            email.textContent = data.email;
            updateUsernameInput.value = data.username;
            updateEmailInput.value = data.email;
        }
    } catch (err) {
        console.error('Error fetching user data:', err);
    }
}

export { fetchUser };
