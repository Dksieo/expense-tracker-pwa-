import { showModal } from '../components/modal.js';
import { getSession, saveVaultData } from '../../lib/vault.js';

export default function attachQuickAdd() {
  document.addEventListener('open-quick-add', async () => {
    const modal = showModal(`
      <div class="header">
        <h3>Quick Add</h3>
        <span class="text-dim">≤ 3 taps</span>
      </div>
      <form id="qa-form" style="display:grid; gap:12px; margin-top:12px">
        <input name="amount" type="number" step="0.01" inputmode="decimal" placeholder="Amount" autofocus style="width:100%; padding:14px; border-radius:12px; background:#0e0e0e; color:#fff; border:1px solid var(--border)" />
        <select name="category_id" style="width:100%; padding:12px; border-radius:12px; background:#0e0e0e; color:#fff; border:1px solid var(--border)">
          <option value="food">Food</option>
          <option value="transport">Transport</option>
          <option value="rent">Rent</option>
          <option value="utilities">Utilities</option>
          <option value="entertainment">Entertainment</option>
          <option value="health">Health</option>
          <option value="education">Education</option>
        </select>
        <input name="note" placeholder="Note (optional)" style="width:100%; padding:12px; border-radius:12px; background:#0e0e0e; color:#fff; border:1px solid var(--border)" />
        <button class="btn" type="submit">Save</button>
      </form>
    `);

    modal.panel.querySelector('#qa-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const amount = parseFloat(fd.get('amount'));
      const category_id = fd.get('category_id');
      const note = (fd.get('note') || '').toString();
      if (!amount || !category_id) return;
      try {
        const { key, data } = getSession();
        const currency = localStorage.getItem('preferred_currency') || 'USD';
        const expense = {
          id: undefined,
          amount,
          currency,
          category_id,
          tags: [],
          date_time: new Date().toISOString(),
          merchant: '',
          note,
          payment_method: '',
          receipt_path: '',
          created_at: Date.now(),
          modified_at: Date.now(),
        };
        // If unlocked and have a session key, persist to encrypted vault
        if (key && data) {
          data.expenses.push(expense);
          await saveVaultData(key, data);
        }
        // Always mirror into a local cache to enable dashboard view and offline demo
        const cached = JSON.parse(localStorage.getItem('cached_expenses') || '[]');
        cached.push(expense);
        localStorage.setItem('cached_expenses', JSON.stringify(cached));
        if (!(key && data)) {
          alert('Saved locally (unencrypted). Set a PIN in Settings to enable encryption.');
        }
        modal.overlay.remove();
        document.dispatchEvent(new CustomEvent('expenses-updated'));
      } catch (err) {
        alert('Failed to save: ' + err.message);
      }
    });
  });
}
