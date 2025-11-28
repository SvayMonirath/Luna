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
        } else {
            generalError.textContent = data.message || 'Login successful!';
            generalError.classList.remove('hidden');
            generalError.classList.remove('text-red-400');
            generalError.classList.add('text-green-400');


            localStorage.setItem('accessToken', data.accessToken);

            setTimeout(() => {
                generalError.classList.add('hidden');
            }, 6000);

            // setTimeout(() => {
            //     window.location.href = '/pages/home/home.html'; // Adjust the redirect path as needed
            // }, 1000);
        }
    } catch (err) {
        console.error('Error:', err);
        generalError.textContent = 'Error connecting to server.';
        generalError.classList.remove('hidden');
    }
});
