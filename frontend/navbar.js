// frontend/navbar.js  (NEW FILE)
// Standalone on purpose: no dependency on other scripts, so it works on every page
// (including category-*.html, about.html, categories.html).
(function () {
  function isLoggedIn() {
    var t = localStorage.getItem('authToken');
    return !!t && t !== 'undefined' && t !== 'null';
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem('userData')); } catch (e) { return null; }
  }

  function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
  }

  function renderAuthButton() {
    var btn = document.querySelector('.login-btn');
    if (!btn) return;

    if (isLoggedIn()) {
      var user = getUser();
      var firstName = user && (user.FName || user.fName || user.name);
      btn.textContent = 'Logout';
      btn.title = firstName ? 'Signed in as ' + firstName : 'Logout';
      btn.classList.add('logout-btn');
      btn.removeAttribute('onclick');          // remove inline "go to login.html"
      btn.onclick = logout;
    } else {
      btn.textContent = 'Login / Sign Up';
      btn.classList.remove('logout-btn');
      btn.onclick = function () { window.location.href = 'login.html'; };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAuthButton);
  } else {
    renderAuthButton();
  }
})();