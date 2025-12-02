const form = document.getElementById('loginForm');
const generalError = document.getElementById('generalError');

form.addEventListener('submit', async(e) => {
    e.preventDefault(); // stop default form submission

    generalError.textContent = '';
    generalError.classList.add('hidden');

    // Get input values and trim whitespace
    const username = document.querySelector('input[name="username"]').value.trim();
    const password = document.querySelector('input[name="password"]').value;

    if (!username || !password) {
        generalError.textContent = 'Username and password are required.';
        generalError.classList.remove('hidden');
        generalError.classList.remove('border-green-900/10', 'bg-green-500/20');
        generalError.classList.add('border-red-900/10', 'bg-red-500/20');
        setTimeout(() => {
            generalError.classList.add('hidden');
        }, 5000);
        return;
    }

    try {
        const res = await fetch('http://localhost:5001/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            // Show backend error inline
            generalError.textContent = data.message || 'Login failed';
            generalError.classList.remove('hidden');
            generalError.classList.remove('border-green-900/10', 'bg-green-500/20');
            generalError.classList.add('border-red-900/10', 'bg-red-500/20');
            setTimeout(() => {
                generalError.classList.add('hidden');
            }, 5000);
        } else {
            localStorage.setItem('accessToken', data.accessToken);
            window.location.href = '../Main/main.html';
        }
    } catch (err) {
        console.error('Error:', err);
        generalError.textContent = 'Error connecting to server.';
        generalError.classList.remove('hidden');
        generalError.classList.remove('border-green-900/10', 'bg-green-500/20');
        generalError.classList.add('border-red-900/10', 'bg-red-500/20');
        setTimeout(() => {
            generalError.classList.add('hidden');
        }, 5000);
    }
});
