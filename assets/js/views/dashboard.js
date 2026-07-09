import { COMIDAS, COMIDAS_LABEL, getComidaActual, getMenuReto } from '../meals.js';
import { getEstadoReto } from '../challenge.js';
import { state, getComidas, getHabitos, getAgua, getPasos, sumarAgua, setPasos, isRutinaCompletada, getPerfilActivo, getComidaCustom, getGustico } from '../store.js';

function hoyLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d - off * 60000).toISOString().slice(0, 10);
}

function kcalConsumidas(fecha) {
  const menu = getMenuReto(getEstadoReto().dia);
  if (!menu) return 0;
  const marcadas = getComidas(fecha);
  const foods = state.data.foods.alimentos;
  return marcadas.reduce((acc, c) => {
    const g = getGustico(fecha, c);
    if (g) return acc + g.kcal;
    const custom = getComidaCustom(fecha, c);
    if (custom) return acc + custom.reduce((s, id) => { const f = foods.find(a => a.id === id); return s + (f ? f.kcal : 0); }, 0);
    return acc + (menu[c]?.kcalTotal || 0);
  }, 0);
}

export default function render(mount, deps) {
  const fecha = hoyLocal();
  const reto = getEstadoReto();
  const perfilActivo = getPerfilActivo();
  const perfilNombre = state.data.config.perfiles.find(p => p.id === perfilActivo)?.nombre || perfilActivo;
  const habitos = state.data.habits.habitos;
  const habCompleted = getHabitos(fecha).length;
  const habTotal = habitos.length;
  const agua = getAgua(fecha);
  const aguaObj = state.data.config.objetivosDiarios.aguaVasos;
  const pasos = getPasos(fecha);
  const pasosObj = state.data.config.objetivosDiarios.pasos;
  const rutinaOk = isRutinaCompletada(fecha);
  const kcal = kcalConsumidas(fecha);
  const kcalMin = state.data.config.objetivosDiarios.kcalMin;
  const kcalMax = state.data.config.objetivosDiarios.kcalMax;
  const kcalPct = Math.min(100, Math.round(kcal / kcalMax * 100));

  let comidaActual = getComidaActual();
  const marcadas = getComidas(fecha);
  if (marcadas.includes(comidaActual)) {
    comidaActual = COMIDAS.find(c => !marcadas.includes(c)) || comidaActual;
  }
  const menuHoy = getMenuReto(reto.dia) || {};
  const platoActual = menuHoy[comidaActual]?.plato || '—';
  const kcalActual = menuHoy[comidaActual]?.kcalTotal || 0;
  const rutinaHoy = state.data.routines.rutinas[reto.dia - 1];
  const ejTotal = rutinaHoy ? rutinaHoy.ejercicios.length : 0;

  let banner = '';
  if (reto.estado === 'futuro') {
    banner = `<div class="card text-center text-sm text-[var(--c-soft)] mb-3">El reto aún no comienza. ${reto.fase}. El registro de progreso estará disponible desde el inicio.</div>`;
  } else if (reto.estado === 'completado') {
    banner = `<div class="card text-center text-sm text-[var(--c-text)] mb-3">🎉 ${reto.fase}. ¡Felicidades!</div>`;
  }

  mount.innerHTML = `
    ${banner}<header class="flex items-center justify-between mb-3">
      <div>
        <a href="#selector" class="text-sm text-[var(--c-soft)] hover:underline">${perfilNombre} ⮕</a>
        <h2 class="text-lg text-[var(--c-text)]">${reto.fase}</h2>
      </div>
      <a href="#historial" class="text-2xl" aria-label="Historial">📊</a>
    </header>

    <div class="card">
      <div class="flex justify-between text-sm mb-1"><span>Calorías</span><span>${kcal} / ${kcalMin}-${kcalMax} kcal</span></div>
      <div class="progress-bar"><span style="width:${kcalPct}%"></span></div>
    </div>

    <div class="card flex items-center justify-between">
      <div><div class="text-sm text-[var(--c-soft)]">Hábitos</div><div class="text-xl">${habCompleted}/${habTotal}</div></div>
      <a href="#cuidado" class="text-sm text-[var(--c-pri)]">Ver todos</a>
    </div>

    <div class="card flex items-center justify-between gap-2">
      <div><div class="text-sm text-[var(--c-soft)]">Agua</div><div class="text-xl">${agua}/${aguaObj} vasos</div></div>
      <div class="flex gap-2">
        <button id="agua-menos" class="w-8 h-8 rounded-full bg-[var(--c-pen)] text-lg">-</button>
        <button id="agua-mas" class="w-8 h-8 rounded-full bg-[var(--c-pri)] text-lg">+</button>
      </div>
    </div>

    <div class="card flex items-center justify-between">
      <div><div class="text-sm text-[var(--c-soft)]">Pasos</div>
        <input id="pasos-input" type="number" inputmode="numeric" value="${pasos}" class="w-24 border-b border-[var(--c-pen)] bg-transparent text-xl text-[var(--c-text)] outline-none">
        <span class="text-xs text-[var(--c-soft)]">/ ${pasosObj}</span>
      </div>
    </div>

    <div class="card flex items-center justify-between">
      <div><div class="text-sm text-[var(--c-soft)]">Rutina</div><div class="text-xl">${rutinaOk ? 'Completada ✅' : 'Pendiente'}</div></div>
      <a href="#ejercicio" class="text-sm text-[var(--c-pri)]">Ver rutina</a>
    </div>

    <h3 class="text-sm text-[var(--c-soft)] mt-4 mb-2">ALIMENTACIÓN · ${COMIDAS_LABEL[comidaActual]}</h3>
    <div class="card">
      <div class="font-medium text-[var(--c-text)]">${platoActual}</div>
      <div class="text-xs text-[var(--c-soft)] mb-2">${kcalActual} kcal</div>
      <a href="#alimentacion" class="text-sm text-[var(--c-pri)]">Ver detalle</a>
    </div>

    <h3 class="text-sm text-[var(--c-soft)] mt-4 mb-2">EJERCICIO · Día ${reto.dia}</h3>
    <div class="card">
      <div class="font-medium text-[var(--c-text)]">${rutinaHoy ? rutinaHoy.nombre : '—'}</div>
      <div class="text-xs text-[var(--c-soft)] mb-2">${ejTotal} ejercicios</div>
      <a href="#ejercicio" class="text-sm text-[var(--c-pri)]">Ver rutina</a>
    </div>
  `;

  mount.querySelector('#agua-menos').addEventListener('click', () => { sumarAgua(fecha, -1); render(mount, deps); });
  mount.querySelector('#agua-mas').addEventListener('click', () => { sumarAgua(fecha, 1); render(mount, deps); });
  const pasosInput = mount.querySelector('#pasos-input');
  pasosInput.addEventListener('change', () => { setPasos(fecha, parseInt(pasosInput.value || '0', 10)); });
};