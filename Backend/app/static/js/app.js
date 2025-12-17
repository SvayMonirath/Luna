const app = document.getElementById('app');

function loadPage(page) {
  fetch(`/static/pages/${page}.html`) // <-- note the /static prefix
    .then(res => {
      if (!res.ok) throw new Error('Page not found');
      return res.text();
    })
    .then(html => app.innerHTML = html)
    .catch(() => app.innerHTML = '<h1 class="text-white text-4xl">404 - Page Not Found</h1>');
}

function router() {
  const hash = location.hash.replace('#', '') || 'landing_page/landing'; // <-- default page
  loadPage(hash);
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
