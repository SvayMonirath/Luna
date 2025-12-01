// auth.js

export function checkAuth() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        window.location.href = '/pages/login/login.html?msg=login_required';
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp * 1000; // convert to ms

        if (Date.now() >= exp) {
            localStorage.removeItem("accessToken");
            window.location.href = "/login/login.html";
        }
    } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("accessToken");
        window.location.href = "/login/login.html";
    }
}
