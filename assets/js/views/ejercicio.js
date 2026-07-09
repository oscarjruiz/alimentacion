import { getEstadoReto } from '../challenge.js';
import { getEjercicios, toggleEjercicio, completarRutina, isRutinaCompletada, state } from '../store.js';

function hoyLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d - off * 60000).toISOString().slice(0, 10);
}

export default function render(mount, deps) {
  const fecha = hoyLocal();
  const retoDia = getEstadoReto().dia;
  const rutina = state.data.routines.rutinas[retoDia - 1];
  if (!rutina) {
    mount.innerHTML = '<p class="card">No hay rutina para hoy.</p>';
    return;
  }
  const completados = getEjercicios(fecha);
  const rutinaOk = isRutinaCompletada(fecha);
  const hechos = completados.length;
  const total = rutina.ejercicios.length;
  const pct = Math.round(hechos / total * 100);

  mount.innerHTML = `
    <header class="mb-3">
      <h2 class="text-lg text-[#3A4A5C]">Rutina Día ${retoDia}</h2>
      <div class="text-sm text-[#7A8A9A]">${rutina.nombre}</div>
    </header>
    <div class="card">
      <div class="flex justify-between text-sm mb-1"><span>Ejercicios</span><span>${hechos}/${total}</span></div>
      <div class="progress-bar"><span style="width:${pct}%"></span></div>
    </div>
    <ul class="space-y-2 mt-3">
      ${rutina.ejercicios.map(e => {
        const ok = completados.includes(e.id);
        return `
          <li class="card flex justify-between items-center">
            <div>
              <div class="text-[#3A4A5C]">${e.e}</div>
              <div class="text-xs text-[#7A8A9A]">${e.series} × ${e.reps}</div>
            </div>
            <button data-ex="${e.id}" class="w-7 h-7 rounded-full ${ok ? 'bg-[#B5E8C9]' : 'bg-[#E0E8F0]'} text-sm">${ok ? '✓' : ''}</button>
          </li>`;
      }).join('')}
    </ul>
    <button id="completar" class="mt-4 w-full py-3 rounded-xl font-medium ${rutinaOk ? 'bg-[#B5E8C9] text-[#3A4A5C]' : 'bg-[#A7C7E7] text-white'}">
      ${rutinaOk ? 'Rutina completada ✓' : 'Completar rutina'}
    </button>
    <div class="fixed bottom-16 inset-x-0 max-w-md mx-auto px-4 py-2 bg-white/95 border-t border-[#E0E8F0] text-center text-sm text-[#3A4A5C]">
      ${hechos} de ${total} · ${pct}%
    </div>
  `;

  mount.querySelectorAll('button[data-ex]').forEach(btn => {
    btn.addEventListener('click', () => { toggleEjercicio(fecha, btn.dataset.ex); render(mount, deps); });
  });
  mount.querySelector('#completar').addEventListener('click', () => {
    completarRutina(fecha, !isRutinaCompletada(fecha));
    render(mount, deps);
  });
}