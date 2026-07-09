import { COMIDAS, COMIDAS_LABEL, getComidaActual, getMenuReto } from '../meals.js';
import { getEstadoReto } from '../challenge.js';
import { getComidas, toggleComida } from '../store.js';

function hoyLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d - off * 60000).toISOString().slice(0, 10);
}

let comidaSel = null;

export default function render(mount, deps) {
  const fecha = hoyLocal();
  const retoDia = getEstadoReto().dia;
  const menu = getMenuReto(retoDia) || {};
  const marcadas = getComidas(fecha);
  if (!comidaSel || !COMIDAS.includes(comidaSel)) comidaSel = getComidaActual();
  const plato = menu[comidaSel] || { plato: '—', ingredientes: [], kcalTotal: 0 };
  const marcada = marcadas.includes(comidaSel);
  const kcalTotalDia = marcadas.reduce((acc, c) => acc + (menu[c]?.kcalTotal || 0), 0);
  const kcalMax = deps.store.state.data.config.objetivosDiarios.kcalMax;
  const kcalMin = deps.store.state.data.config.objetivosDiarios.kcalMin;

  mount.innerHTML = `
    <header class="mb-3">
      <h2 class="text-lg text-[#3A4A5C]">Alimentación · Día ${retoDia}</h2>
    </header>
    <div class="tab-scroll mb-3">
      ${COMIDAS.map(c => `
        <button data-comida="${c}" class="px-3 py-1.5 rounded-xl text-sm whitespace-nowrap ${comidaSel === c ? 'bg-[#A7C7E7] text-white' : 'bg-white text-[#7A8A9A] border border-[#E0E8F0]'}">
          ${COMIDAS_LABEL[c]}${marcadas.includes(c) ? ' ✓' : ''}
        </button>
      `).join('')}
    </div>

    <div class="card">
      <div class="flex justify-between items-start">
        <h3 class="font-semibold text-[#3A4A5C]">${plato.plato}</h3>
        <span class="rounded-full px-3 py-1 text-sm bg-[#D4C5F9] text-[#3A4A5C]">${plato.kcalTotal} kcal</span>
      </div>
      <ul class="mt-3 divide-y divide-[#E0E8F0]">
        ${(plato.ingredientes || []).map(ing => `
          <li class="py-2 flex justify-between text-sm">
            <span class="text-[#3A4A5C]">${ing.i}</span>
            <span class="text-[#7A8A9A]">${ing.cantidad} · ${ing.kcal} kcal</span>
          </li>
        `).join('')}
      </ul>
      <button id="toggle-comida" class="mt-3 w-full py-2 rounded-xl font-medium ${marcada ? 'bg-[#B5E8C9] text-[#3A4A5C]' : 'bg-[#A7C7E7] text-white'}">
        ${marcada ? 'Comida consumida ✓' : 'Marcar como consumida'}
      </button>
    </div>

    <div class="fixed bottom-16 inset-x-0 max-w-md mx-auto px-4 py-2 bg-white/95 border-t border-[#E0E8F0] flex justify-between text-sm text-[#3A4A5C]">
      <span>Calorías del día</span>
      <span><b>${kcalTotalDia}</b> / ${kcalMin}-${kcalMax} kcal</span>
    </div>
  `;

  mount.querySelectorAll('button[data-comida]').forEach(btn => {
    btn.addEventListener('click', () => { comidaSel = btn.dataset.comida; render(mount, deps); });
  });
  mount.querySelector('#toggle-comida').addEventListener('click', () => {
    toggleComida(fecha, comidaSel);
    render(mount, deps);
  });
}