const form = document.getElementById('registerForm');
const generalError = document.getElementById('generalError');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop default form submission

    // Clear previous errors
    generalError.textContent = '';
    generalError.classList.add('hidden');

    setTimeout(() => {
        generalError.classList.add('hidden');
    }, 5000);

    // Get input values and trim whitespace
    const username = document.querySelector('input[name="username"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
    const password = document.querySelector('input[name="password"]').value;
    const confirmPassword = document.querySelector('input[name="confirm_password"]').value;

    // Inline error handling
    if (!username || !email || !password || !confirmPassword) {
        generalError.textContent = 'All fields are required.';
        generalError.classList.remove('hidden');
        generalError.classList.remove('border-green-900/10', 'bg-green-500/20');
        generalError.classList.add('border-red-900/10', 'bg-red-500/20');
        setTimeout(() => {
            generalError.classList.add('hidden');
        }, 5000);
        return;
    }

    if (password !== confirmPassword) {
        generalError.textContent = 'Passwords do not match.';
        generalError.classList.remove('hidden');
        generalError.classList.remove('border-green-900/10', 'bg-green-500/20');
        generalError.classList.add('border-red-900/10', 'bg-red-500/20');
        setTimeout(() => {
            generalError.classList.add('hidden');
        }, 5000);
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
            generalError.classList.remove('border-red-900/10', 'bg-red-500/20');
            generalError.classList.add('border-green-900/10', 'bg-green-500/20');

            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = '/Backend/app/static/pages/login/login.html';
            }, 1000);
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
