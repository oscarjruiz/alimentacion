export default function render(mount, deps) {
  const { store, router } = deps;
  const perfiles = store.state.data.config.perfiles;
  mount.innerHTML = `
    <div class="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div class="text-center mb-4">
        <h1 class="text-2xl text-[var(--c-text)] mb-1">Reto 90 Días</h1>
        <p class="text-sm text-[var(--c-soft)]">Elige tu perfil para comenzar</p>
      </div>
      ${perfiles.map(p => `
        <button data-id="${p.id}" class="card w-full max-w-xs py-6 text-center text-xl font-semibold text-[var(--c-text)] hover:bg-[var(--c-bg)] transition">
          ${p.nombre}
        </button>
      `).join('')}
      <p class="text-xs text-[var(--c-soft)] text-center max-w-xs">Tu progreso se guarda localmente en este dispositivo.</p>
    </div>`;
  mount.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.setPerfil(btn.dataset.id);
      router.navigate('#dashboard');
    });
  });
}