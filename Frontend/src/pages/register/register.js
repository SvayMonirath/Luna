const form = document.getElementById('registerForm');
const generalError = document.getElementById('generalError');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop default form submission

    // Clear previous errors
    generalError.textContent = '';
    generalError.classList.add('hidden');

    // Get input values and trim whitespace
    const username = document.querySelector('input[name="username"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
    const password = document.querySelector('input[name="password"]').value;
    const confirmPassword = document.querySelector('input[name="confirm_password"]').value;

    // Inline error handling
    if (!username || !email || !password || !confirmPassword) {
        generalError.textContent = 'All fields are required.';
        generalError.classList.remove('hidden');
        return;
    }

    if (password !== confirmPassword) {
        generalError.textContent = 'Passwords do not match.';
        generalError.classList.remove('hidden');
        return;
    }

    try {
        const res = await fetch('http://localhost:5001/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, confirm_password: confirmPassword })
        });

        const data = await res.json();

        if (!res.ok) {
            // Show backend error inline
            generalError.textContent = data.message || 'Registration failed';
            generalError.classList.remove('hidden');
        } else {
            // Success message (could also redirect immediately)
            generalError.textContent = data.message || 'Registration successful!';
            generalError.classList.remove('hidden');
            generalError.classList.remove('text-red-400');
            generalError.classList.add('text-green-400');

            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = '../login/login.html';
            }, 1000);
        }
    } catch (err) {
        console.error('Error:', err);
        generalError.textContent = 'Error connecting to server.';
        generalError.classList.remove('hidden');
    }
});
