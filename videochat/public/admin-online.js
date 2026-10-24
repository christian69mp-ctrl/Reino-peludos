// Panel: casilla «Mostrar en la web cuántas personas hay en línea» (pestaña Anuncio)
(function () {
  const box = document.getElementById('showOnline');
  const call = (body) => fetch('/api/admin/show-online', {
    method: body ? 'POST' : 'GET',
    headers: { 'x-admin-token': adminToken, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json());
  const load = () => call().then((r) => { box.checked = !!r.on; }).catch(() => {});
  document.querySelector('[data-view="announce"]').addEventListener('click', load);
  box.addEventListener('change', async () => {
    const r = await call({ on: box.checked });
    toast(r.on ? 'Contador en línea visible en la web' : 'Contador en línea oculto');
  });
})();
