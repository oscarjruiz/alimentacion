import { getHabitos, toggleHabito, getAgua, sumarAgua, state } from '../store.js';

function hoyLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d - off * 60000).toISOString().slice(0, 10);
}

function habitosCompletados(fecha) {
  const todos = state.data.habits.habitos;
  const marcados = getHabitos(fecha);
  const agua = getAgua(fecha);
  const aguaObj = state.data.config.objetivosDiarios.aguaVasos;
  return todos.filter(h => h.id === 'hidratacion' ? agua >= aguaObj : marcados.includes(h.id)).length;
}

export default function render(mount, deps) {
  const fecha = hoyLocal();
  const habitos = state.data.habits.habitos;
  const marcados = getHabitos(fecha);
  const agua = getAgua(fecha);
  const aguaObj = state.data.config.objetivosDiarios.aguaVasos;
  const completados = habitosCompletados(fecha);
  const pct = Math.round(completados / habitos.length * 100);

  mount.innerHTML = `
    <header class="mb-3">
      <h2 class="text-lg text-[#3A4A5C]">Cuidado Personal</h2>
    </header>
    <ul class="space-y-2">
      ${habitos.map(h => {
        if (h.id === 'hidratacion') {
          const ok = agua >= aguaObj;
          const vasos = Array.from({length: aguaObj}).map((_,i) => `<button data-vaso="${i}" class="text-2xl ${i < agua ? '' : 'opacity-30'}">💧</button>`).join('');
          return `
            <li class="card" data-h="${h.id}">
              <div class="flex justify-between items-center">
                <span class="text-[#3A4A5C]">${h.icono} ${h.nombre}</span>
                <span class="text-sm ${ok ? 'text-[#B5E8C9]' : 'text-[#7A8A9A]'}">${ok ? '✓' : agua + '/' + aguaObj}</span>
              </div>
              <div class="flex flex-wrap gap-1 mt-2" id="vasos">${vasos}</div>
              <div class="flex gap-2 mt-2">
                <button id="agua-menos" class="px-3 py-1 rounded-lg bg-[#E0E8F0]">-</button>
                <button id="agua-mas" class="px-3 py-1 rounded-lg bg-[#A7C7E7] text-white">+</button>
              </div>
            </li>`;
        }
        const ok = marcados.includes(h.id);
        return `
          <li class="card flex justify-between items-center" data-h="${h.id}">
            <span class="text-[#3A4A5C]">${h.icono} ${h.nombre}</span>
            <button data-toggle="${h.id}" class="w-7 h-7 rounded-full ${ok ? 'bg-[#B5E8C9]' : 'bg-[#E0E8F0]'} text-sm">${ok ? '✓' : ''}</button>
          </li>`;
      }).join('')}
    </ul>
    ${completados === habitos.length ? '<div class="card text-center text-[#B5E8C9] font-medium">Día completo 🎉</div>' : ''}
    <div class="fixed bottom-16 inset-x-0 max-w-md mx-auto px-4 py-2 bg-white/95 border-t border-[#E0E8F0] text-center text-sm text-[#3A4A5C]">
      ${completados} de ${habitos.length} hábitos completados · ${pct}%
    </div>
  `;

  mount.querySelectorAll('button[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => { toggleHabito(fecha, btn.dataset.toggle); render(mount, deps); });
  });
  mount.querySelector('#agua-menos').addEventListener('click', () => { sumarAgua(fecha, -1); render(mount, deps); });
  mount.querySelector('#agua-mas').addEventListener('click', () => { sumarAgua(fecha, 1); render(mount, deps); });
  mount.querySelectorAll('button[data-vaso]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.vaso, 10);
      sumarAgua(fecha, (idx + 1) - agua);
      render(mount, deps);
    });
  });
}