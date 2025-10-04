import { initRouter, navigate } from "./router.js";
import { renderNavbar } from "./ui/navbar.js";
import renderDashboard from "./ui/views/dashboard.js";
import renderOnboarding from "./ui/views/onboarding.js";
import renderUnlock from "./ui/views/unlock.js";
import { isVaultInitialized } from "./lib/vault.js";
import attachQuickAdd from "./ui/views/quickAdd.js";

function renderReports(root) {
  root.innerHTML = `
    <section class="card">
      <div class="header">
        <h2>Reports</h2>
        <span class="text-dim">Coming soon</span>
      </div>
      <p class="text-dim">Charts and insights will appear here.</p>
      <div style="height:8px"></div>
      <button class="btn" id="export-csv">Export CSV</button>
    </section>
  `;

  document.getElementById('export-csv')?.addEventListener('click', () => {
    const cached = JSON.parse(localStorage.getItem('cached_expenses') || '[]');
    import('./lib/export.js').then(m => m.exportCsv(cached));
  });
}

function renderSettings(root) {
  root.innerHTML = `
    <section class="card">
      <div class="header">
        <h2>Settings</h2>
        <span class="text-dim">Basic</span>
      </div>
      <div>
        <p class="text-dim">Dark theme is default. Onboarding, PIN, and backups coming next.</p>
      </div>
    </section>
  `;
}

function bootstrap() {
  const app = document.getElementById("app");

  const view = document.createElement("main");
  view.id = "view";
  app.appendChild(view);

  const navbar = document.createElement("div");
  renderNavbar(navbar);
  document.body.appendChild(navbar);

  const routes = {
    home: renderDashboard,
    reports: renderReports,
    settings: renderSettings,
    onboarding: renderOnboarding,
    unlock: renderUnlock,
  };

  initRouter(routes, view);

  // Gate routes until unlocked / initialized
  (async () => {
    const initialized = await isVaultInitialized();
    const unlocked = sessionStorage.getItem('unlocked') === '1';
    if (!initialized) {
      window.location.hash = '#/onboarding';
    } else if (!unlocked) {
      window.location.hash = '#/unlock';
    }
    // Attach handlers after initial gate evaluation
    attachQuickAdd();
  })();

  document.addEventListener("open-quick-add", () => {
    // initialized via attachQuickAdd
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  }

  // Keyboard shortcut: N = new expense (desktop)
  window.addEventListener("keydown", (e) => {
    if ((e.key === "n" || e.key === "N") && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent("open-quick-add"));
    }
  });
}

document.addEventListener("DOMContentLoaded", bootstrap);
