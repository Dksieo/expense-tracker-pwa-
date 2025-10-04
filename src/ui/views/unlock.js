import { unlockVault } from '../../lib/vault.js';

export default function renderUnlock(root) {
  root.innerHTML = `
    <section class="card" style="margin-top:12px;">
      <div class="header">
        <h2>Unlock</h2>
        <span class="text-dim">Enter your PIN</span>
      </div>
      <form id="unlock-form" autocomplete="off">
        <input name="pin" type="password" inputmode="numeric" pattern="[0-9]*" autofocus placeholder="PIN" minlength="4" maxlength="8" style="width:100%; padding:14px; border-radius:12px; background:#0e0e0e; color:#fff; border:1px solid var(--border)" />
        <div style="height:10px"></div>
        <button class="btn" type="submit">Unlock</button>
      </form>
      <div style="height:10px"></div>
      <button class="btn secondary" id="skip">Skip (no PIN)</button>
    </section>
  `;

  root.querySelector('#unlock-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pin = new FormData(e.currentTarget).get('pin');
    try {
      await unlockVault(pin);
      sessionStorage.setItem('unlocked', '1');
      sessionStorage.setItem('session_pin', pin);
      window.location.hash = '#/home';
    } catch {
      alert('Incorrect PIN');
    }
  });

  root.querySelector('#skip').addEventListener('click', () => {
    sessionStorage.setItem('unlocked', '1');
    window.location.hash = '#/home';
  });
}
