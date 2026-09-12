let token = null;

const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const togglePassword = document.getElementById('togglePassword');
const logoutBtn = document.getElementById('logoutBtn');

async function api(url, options = {}) {
  options.credentials = 'same-origin';
  options.headers = {
    ...(options.headers || {})
  };
  return fetch(url, options);
}

function showLogin() {
  loginScreen.hidden = false;
  adminPanel.hidden = true;
  setTimeout(() => loginEmail?.focus(), 100);
}

function showAdmin() {
  loginScreen.hidden = true;
  adminPanel.hidden = false;
}

loginForm?.addEventListener('submit', async function (e) {
  e.preventDefault();
  loginError.textContent = '';

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!email || !password) {
    loginError.textContent = 'Please enter email and password.';
    return;
  }

  const button = loginForm.querySelector('.login-btn');
  button.disabled = true;
  button.style.opacity = '.7';
  button.innerHTML = '<span>Signing in...</span><span>•••</span>';

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(
        data.error || data.message || 'Invalid admin credentials'
      );
    }

    location.reload();

  } catch (error) {
    loginError.textContent =
      error.message || 'Login failed. Please try again.';

    button.disabled = false;
    button.style.opacity = '1';
    button.innerHTML = '<span>Sign In</span><span>→</span>';
  }
});

togglePassword?.addEventListener('click', function () {
  if (loginPassword.type === 'password') {
    loginPassword.type = 'text';
    togglePassword.textContent = '🙈';
  } else {
    loginPassword.type = 'password';
    togglePassword.textContent = '👁';
  }
});

async function load() {
  try {
    const response = await api('/api/admin/session', {
      credentials: 'same-origin'
    });

    if (response.status === 401 || response.status === 403) {
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error('Unable to load dashboard');
    }

    const session = await response.json();

    if (!session.authenticated) {
      showLogin();
      return;
    }

    const statsResponse = await api('/api/admin/stats', {
      credentials: 'same-origin'
    });

    if (statsResponse.status === 401 || statsResponse.status === 403) {
      showLogin();
      return;
    }

    if (!statsResponse.ok) {
      throw new Error('Unable to load dashboard');
    }

    const s = await statsResponse.json();

    showAdmin();

    document.getElementById('stats').innerHTML = [
      ['Users', s.users],
      ['Videos', s.videos],
      ['Blogs', s.blogs],
      ['Premium', s.premium],
      ['Revenue', `₹${s.payments}`]
    ].map(x => `
      <div class="stat">
        ${x[0]}
        <strong>${x[1]}</strong>
      </div>
    `).join('');

  } catch (error) {
    console.error(error);
    showLogin();
  }
}

async function addVideo() {
  const response = await api('/api/admin/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({
      title: document.getElementById('vt').value,
      youtube_id: document.getElementById('vy').value,
      channel: document.getElementById('vc').value,
      category: document.getElementById('vg').value,
      access: document.getElementById('va').value
    })
  });

  if (response.status === 401 || response.status === 403) {
    location.reload();
    return;
  }

  if (!response.ok) {
    alert('Failed to add video.');
    return;
  }

  alert('Video added successfully.');
  load();
}

async function addBlog() {
  const response = await api('/api/admin/blogs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({
      title: document.getElementById('bt').value,
      author: document.getElementById('ba').value,
      featured_image: document.getElementById('bi').value,
      content: document.getElementById('bc').value,
      access: document.getElementById('bx').value
    })
  });

  if (response.status === 401 || response.status === 403) {
    location.reload();
    return;
  }

  if (!response.ok) {
    alert('Failed to publish article.');
    return;
  }

  alert('Article published successfully.');
  load();
}

logoutBtn?.addEventListener('click', async function () {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });
  } catch (e) {
    console.log(e);
  }

  location.reload();
});

load();
