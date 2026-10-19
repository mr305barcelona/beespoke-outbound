(() => {
  const key = 'beespoke-internal-traffic-v1';
  const status = document.getElementById('analytics-status');
  const detail = document.getElementById('analytics-detail');
  const exclude = document.getElementById('exclude-analytics');
  const restore = document.getElementById('restore-analytics');
  function render() {
    try {
      const off = localStorage.getItem(key) === 'exclude';
      status.textContent = off ? 'Excluded in this browser' : 'Analytics is enabled in this browser';
      detail.textContent = off ? 'Visits from this browser profile are excluded. The setting applies across this website.' : 'Choose Exclude this browser to stop measurement of your work and audit visits.';
      exclude.disabled = off;
      restore.disabled = !off;
    } catch {
      status.textContent = 'This browser cannot save the setting';
      detail.textContent = 'Browser storage is unavailable. Nothing has changed.';
      exclude.disabled = restore.disabled = true;
    }
  }
  exclude.addEventListener('click', () => {
    try { localStorage.setItem(key, 'exclude'); } catch { /* render reports unavailable storage */ }
    render();
  });
  restore.addEventListener('click', () => {
    try { localStorage.removeItem(key); } catch { /* render reports unavailable storage */ }
    render();
  });
  addEventListener('storage', event => { if (event.key === key) render(); });
  render();
})();
