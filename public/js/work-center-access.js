import { auth } from './admin-firebase-config.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from './local-auth.js';

const accessRoot = document.querySelector('[data-work-center-access="panel"]');
const loginSection = document.getElementById('work-center-login-section');
const appSection = document.getElementById('work-center-app-section');
const loginForm = document.getElementById('work-center-login-form');
const loginEmail = document.getElementById('work-center-email');
const loginPassword = document.getElementById('work-center-password');
const loginError = document.getElementById('work-center-login-error');
const logoutButton = document.getElementById('work-center-logout');

function setError(message = '') {
  if (!loginError) return;
  loginError.textContent = message;
  loginError.classList.toggle('hidden', !message);
}

function showLogin() {
  loginSection?.classList.remove('hidden');
  appSection?.classList.add('hidden');
}

function showApp(user) {
  loginSection?.classList.add('hidden');
  appSection?.classList.remove('hidden');
  window.dispatchEvent(new CustomEvent('nelly:work-center-authenticated', {
    detail: { user, center: accessRoot?.dataset?.center || 'work-center' }
  }));
}

if (accessRoot && loginForm && loginSection && appSection) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setError('');

    try {
      const email = String(loginEmail?.value || '').trim();
      const password = String(loginPassword?.value || '');
      const result = await signInWithEmailAndPassword(auth, email, password);
      showApp(result.user);
    } catch (error) {
      setError(`No se pudo abrir este centro: ${error.message}`);
      showLogin();
    }
  });

  logoutButton?.addEventListener('click', async () => {
    await signOut(auth);
    setError('');
    showLogin();
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      showApp(user);
      return;
    }
    showLogin();
  });
}
