import { setupVaultWithPin } from '../../lib/vault.js';
import { seedDefaultCategories } from '../../lib/db.js';

export default function renderOnboarding(root) {
  root.innerHTML = `
    <section class="card" style="margin-top:12px;">
      <div class="header">
        <h2>Welcome</h2>
        <span class="text-dim">Local-first • Encrypted</span>
      </div>
      <p class="text-dim">Choose your currency and set an optional PIN to encrypt your data. You can change this later in Settings.</p>
      <form id="onb-form" autocomplete="off">
        <div style="display:grid; gap:12px; margin:12px 0;">
          <label>
            <span class="text-dim">Preferred currency</span>
            <select name="currency" style="width:100%; padding:10px; border-radius:10px; background:#0e0e0e; color:#fff; border:1px solid var(--border)">
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
              <option value="BDT">BDT ৳</option>
              <option value="INR">INR ₹</option>
            </select>
          </label>
          <label>
            <span class="text-dim">Set PIN (optional)</span>
            <input name="pin" type="password" inputmode="numeric" pattern="[0-9]*" placeholder="4-8 digits" minlength="4" maxlength="8" style="width:100%; padding:10px; border-radius:10px; background:#0e0e0e; color:#fff; border:1px solid var(--border)" />
          </label>
        </div>
        <button class="btn" type="submit">Continue</button>
      </form>
    </section>
  `;

  root.querySelector('#onb-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const currency = form.get('currency') || 'USD';
    const pin = (form.get('pin') || '').toString().trim();
    try {
      if (pin) {
        await setupVaultWithPin(pin);
        sessionStorage.setItem('unlocked', '1');
        sessionStorage.setItem('session_pin', pin);
        window.location.hash = '#/home';
      } else {
        // No PIN mode: proceed unlocked without encryption
        sessionStorage.setItem('unlocked', '1');
        window.location.hash = '#/home';
      }
      await seedDefaultCategories();
      localStorage.setItem('preferred_currency', currency);
    } catch (err) {
      alert('Setup failed: ' + err.message);
    }
  });
}
