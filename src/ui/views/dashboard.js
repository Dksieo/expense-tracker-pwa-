function formatAmount(value, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

async function computeSummary(expenses) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const currentMonthExpenses = expenses.filter((e) => (e.date_time || '').startsWith(monthKey));
  const total = currentMonthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const byCategory = new Map();
  for (const e of currentMonthExpenses) {
    byCategory.set(e.category_id, (byCategory.get(e.category_id) || 0) + Number(e.amount || 0));
  }
  const top = [...byCategory.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3);
  return { total, top };
}

import { getSession } from '../../lib/vault.js';

export default function renderDashboard(root) {
  const currency = localStorage.getItem('preferred_currency') || 'USD';

  root.innerHTML = `
    <section class="card" style="margin-top:12px">
      <div class="header">
        <h2>Dashboard</h2>
        <span class="text-dim">This month</span>
      </div>
      <div class="grid" id="summary-cards">
        <div class="card">
          <h3>Total Spend</h3>
          <div class="text-dim" id="total-spend">${formatAmount(0, currency)}</div>
        </div>
        <div class="card">
          <h3>Top Categories</h3>
          <div class="text-dim" id="top-categories">—</div>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="header">
        <h3>Recent Expenses</h3>
        <button class="btn" id="quick-add">+ Quick Add</button>
      </div>
      <div id="recent-list" style="display:grid; gap:10px"></div>
    </section>
  `;

  function renderList(expenses) {
    const list = root.querySelector('#recent-list');
    if (!expenses.length) {
      list.innerHTML = `<div class="text-dim">Empty</div>`;
      return;
    }
    list.innerHTML = expenses.slice(-10).reverse().map((e) => {
      const date = new Date(e.date_time || Date.now());
      return `
        <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:12px;">
          <div>
            <div style="font-weight:600">${e.category_id}</div>
            <div class="text-dim" style="font-size:12px;">${date.toLocaleDateString()} ${e.note ? '· ' + e.note : ''}</div>
          </div>
          <div style="font-weight:700">${formatAmount(Number(e.amount||0), currency)}</div>
        </div>
      `;
    }).join('');
  }

  async function refresh() {
    try {
      // Prefer in-memory decrypted session data; fallback to cached local mirror
      const session = getSession();
      const stored = (session && session.data && Array.isArray(session.data.expenses))
        ? session.data.expenses
        : JSON.parse(localStorage.getItem('cached_expenses') || '[]');
      const { total, top } = await computeSummary(stored);
      root.querySelector('#total-spend').textContent = formatAmount(total, currency);
      root.querySelector('#top-categories').textContent = top.map(([c, v]) => `${c} (${formatAmount(v, currency)})`).join(', ') || '—';
      renderList(stored);
    } catch (e) {
      // noop
    }
  }

  document.querySelector('#quick-add')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('open-quick-add'));
  });

  document.addEventListener('expenses-updated', () => {
    // As a temporary measure, mirror encrypted writes into a non-sensitive cache for demo
    // In a real app, we'd decrypt and compute in-memory only.
    try {
      const cache = JSON.parse(localStorage.getItem('cached_expenses') || '[]');
      const last = cache[cache.length - 1];
      // No-op; refreshed by quickAdd explicitly adding to cache
    } catch {}
    refresh();
  });

  refresh();
}
