export function initRouter(routes, mountNode) {
  function getPath() {
    const hash = window.location.hash || "#";
    const cleaned = hash.replace(/^#\/?/, "");
    return cleaned || "home";
  }

  function render() {
    const path = getPath();
    const view = routes[path] || routes["home"];
    mountNode.innerHTML = "";
    view(mountNode);
    document.dispatchEvent(new CustomEvent("route-changed", { detail: { path } }));
  }

  window.addEventListener("hashchange", render);
  window.addEventListener("load", () => {
    if (!window.location.hash) {
      window.location.hash = "#/home";
    }
    render();
  });
}

export function navigate(path) {
  window.location.hash = `#/${path}`;
}
