export default function render(mount, deps) {
  const { store, router } = deps;
  const perfiles = store.state.data.config.perfiles;
  mount.innerHTML = `
    <div class="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div class="text-center mb-4">
        <h1 class="text-2xl text-[#3A4A5C] mb-1">Reto 90 Días</h1>
        <p class="text-sm text-[#7A8A9A]">Elige tu perfil para comenzar</p>
      </div>
      ${perfiles.map(p => `
        <button data-id="${p.id}" class="card w-full max-w-xs py-6 text-center text-xl font-semibold text-[#3A4A5C] hover:bg-[#F5F7FA] transition">
          ${p.nombre}
        </button>
      `).join('')}
    </div>`;
  mount.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.setPerfil(btn.dataset.id);
      router.navigate('#dashboard');
    });
  });
}