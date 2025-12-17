export function checkAuth() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        window.location.href = '/static/pages/login/login.html?msg=login_required';
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp * 1000;

        if (Date.now() >= exp) {
            localStorage.removeItem("accessToken");
            window.location.href = "/static/pages/login/login.html";
        }
    } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("accessToken");
        window.location.href = "/static/pages/login/login.html";
    }
}
