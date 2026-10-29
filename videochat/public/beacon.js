// Cuenta la visita solo cuando la página se abre de verdad en un navegador y se ve en pantalla
// (los robots que solo descargan la página no ejecutan esto). Sin cookies ni datos personales.
(function () {
  if (navigator.webdriver || !navigator.sendBeacon) return;
  const send = () => setTimeout(() => {
    try { navigator.sendBeacon('/api/v', new Blob(['{}'], { type: 'application/json' })); } catch { /* sin estadística */ }
  }, 1500);
  if (document.visibilityState === 'visible') { send(); return; }
  document.addEventListener('visibilitychange', function shown() {
    if (document.visibilityState !== 'visible') return;
    document.removeEventListener('visibilitychange', shown);
    send();
  });
})();
