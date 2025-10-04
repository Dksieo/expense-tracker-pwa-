import { navigate } from "../router.js";

export function renderNavbar(container) {
  container.className = "navbar";
  container.innerHTML = `
    <a class="nav-item" data-path="home">
      <span class="icon">🏠</span>
      <span>Home</span>
    </a>
    <a class="nav-item" data-path="reports">
      <span class="icon">📈</span>
      <span>Reports</span>
    </a>
    <button class="fab" aria-label="Add expense">＋</button>
    <a class="nav-item" data-path="settings">
      <span class="icon">⚙️</span>
      <span>Settings</span>
    </a>
  `;

  container.querySelectorAll(".nav-item").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const path = el.getAttribute("data-path");
      navigate(path);
    });
  });

  container.querySelector(".fab").addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("open-quick-add"));
  });

  function syncActive(path) {
    container.querySelectorAll(".nav-item").forEach((el) => {
      const elPath = el.getAttribute("data-path");
      el.classList.toggle("active", elPath === path);
    });
  }

  document.addEventListener("route-changed", (e) => {
    syncActive(e.detail.path);
  });

  // Initialize active state
  const initial = (window.location.hash.replace(/^#\/?/, "") || "home");
  syncActive(initial);
}
