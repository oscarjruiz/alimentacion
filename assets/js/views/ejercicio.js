import { getEstadoReto } from '../challenge.js';
import { getEjercicios, toggleEjercicio, completarRutina, isRutinaCompletada, state, setPeso, getPeso, getPesosRecientes, getRacha } from '../store.js';

const DIAS_SEMANA = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function hoyLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d - off * 60000).toISOString().slice(0, 10);
}

let tipAbierto = null;
let timerSegundos = 0;
let timerTotal = 60;
let timerInterval = null;

function startTimer(segundos, renderFn, mount, deps) {
  stopTimer();
  timerTotal = segundos;
  timerSegundos = segundos;
  timerInterval = setInterval(() => {
    timerSegundos--;
    if (timerSegundos <= 0) {
      stopTimer();
    }
    renderFn(mount, deps);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function fmtTimer(s) {
  const m = Math.floor(s / 60);
  const seg = s % 60;
  return m + ':' + (seg < 10 ? '0' : '') + seg;
}

function semanalChips(fecha) {
  const d = new Date(fecha + 'T00:00:00');
  const hoy = new Date(hoyLocal() + 'T00:00:00');
  const offset = d.getDay();
  const lunes = new Date(d);
  lunes.setDate(d.getDate() - (offset === 0 ? 6 : offset - 1));

  let html = '<div class="tab-scroll mb-3">';
  for (let i = 0; i < 7; i++) {
    const dia = new Date(lunes.getTime() + i * 86400000);
    const f = dia.toISOString().slice(0, 10);
    const done = isRutinaCompletada(f);
    const isToday = f === hoyLocal();
    const isFuture = dia > hoy;
    html += `
      <div class="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs
        ${isToday ? 'bg-[var(--c-pri)] text-white' : done ? 'bg-[var(--c-ok)] text-[var(--c-text)]' : isFuture ? 'bg-[var(--c-pen)] text-[var(--c-soft)] opacity-50' : 'bg-[var(--c-pen)] text-[var(--c-soft)]'}">
        <span>${DIAS_SEMANA[dia.getDay()]}</span>
        <span>${dia.getDate()}</span>
      </div>`;
  }
  html += '</div>';
  return html;
}

function pesoChart(pesos) {
  if (pesos.length < 2) return '';
  const w = 240, h = 50, pad = 10;
  const valores = pesos.map(p => p.peso);
  const min = Math.min(...valores) - 1;
  const max = Math.max(...valores) + 1;
  const range = max - min || 1;
  const stepX = pesos.length > 1 ? (w - pad * 2) / (pesos.length - 1) : 0;

  let svg = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" fill="none">`;
  svg += `<polyline points="${pesos.map((p, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (p.peso - min) / range) * (h - pad * 2);
    return x + ',' + y;
  }).join(' ')}" stroke="var(--c-pri)" stroke-width="2" fill="none"/>`;
  pesos.forEach((p, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (p.peso - min) / range) * (h - pad * 2);
    svg += `<circle cx="${x}" cy="${y}" r="3" fill="var(--c-pri)"/>`;
    if (i === 0 || i === pesos.length - 1) {
      svg += `<text x="${x}" y="${y - 6}" text-anchor="middle" font-size="8" fill="var(--c-soft)">${p.peso}</text>`;
    }
  });
  svg += '</svg>';
  return svg;
}

export default function render(mount, deps) {
  const fecha = hoyLocal();
  const reto = getEstadoReto();
  const retoDia = reto.dia;
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
  const racha = getRacha();
  const pesoActual = getPeso(fecha);
  const pesosRecientes = getPesosRecientes(7);

  mount.innerHTML = `
    <header class="mb-3">
      <div class="flex justify-between items-center">
        <h2 class="text-lg text-[var(--c-text)]">Ejercicio · Día ${retoDia}</h2>
        ${racha > 1 ? `<span class="text-xs text-[var(--c-accent)] font-medium">🔥 ${racha} días</span>` : ''}
      </div>
      <div class="text-sm text-[var(--c-soft)]">${rutina.nombre}</div>
    </header>

    ${semanalChips(fecha)}

    <div class="card">
      <div class="flex justify-between text-sm mb-1"><span>Progreso</span><span>${hechos}/${total}</span></div>
      <div class="progress-bar"><span style="width:${pct}%"></span></div>
    </div>

    <ul class="space-y-2 mt-3">
      ${rutina.ejercicios.map(e => {
        const ok = completados.includes(e.id);
        const open = tipAbierto === e.id;
        return `
          <li class="card cursor-pointer" data-tip="${e.id}">
            <div class="flex justify-between items-center">
              <div class="flex-1">
                <div class="text-[var(--c-text)] text-sm">${e.e}</div>
                <div class="text-xs text-[var(--c-soft)]">${e.series} × ${e.reps}</div>
              </div>
              <button data-ex="${e.id}" class="w-7 h-7 rounded-full ${ok ? 'bg-[var(--c-ok)]' : 'bg-[var(--c-pen)]'} text-sm shrink-0 ml-2">${ok ? '✓' : ''}</button>
            </div>
            ${open ? `<div class="mt-2 pt-2 border-t border-[var(--c-pen)] text-xs text-[var(--c-soft)]">💡 ${e.tips}</div>` : ''}
          </li>`;
      }).join('')}
    </ul>

    <div class="card mt-3">
      <div class="flex items-center justify-between gap-2">
        <span class="text-sm text-[var(--c-soft)]">Descanso</span>
        <span class="text-lg font-mono text-[var(--c-text)]">${timerInterval ? fmtTimer(timerSegundos) : fmtTimer(timerTotal)}</span>
        <div class="flex gap-1">
          <button id="timer-60" class="px-2 py-1 rounded-lg text-xs ${timerTotal === 60 && !timerInterval ? 'bg-[var(--c-pri)] text-white' : 'bg-[var(--c-pen)] text-[var(--c-soft)]'}">60s</button>
          <button id="timer-90" class="px-2 py-1 rounded-lg text-xs ${timerTotal === 90 && !timerInterval ? 'bg-[var(--c-pri)] text-white' : 'bg-[var(--c-pen)] text-[var(--c-soft)]'}">90s</button>
        </div>
        <button id="timer-start" class="px-3 py-1 rounded-lg text-xs font-medium ${timerInterval ? 'bg-[var(--c-pen)] text-[var(--c-text)]' : 'bg-[var(--c-ok)] text-[var(--c-text)]'}">
          ${timerInterval ? '⏸️' : '▶️'}
        </button>
      </div>
    </div>

    <button id="completar" class="mt-3 w-full py-3 rounded-xl font-medium ${rutinaOk ? 'bg-[var(--c-ok)] text-[var(--c-text)]' : 'bg-[var(--c-pri)] text-white'}">
      ${rutinaOk ? 'Rutina completada ✓' : 'Completar rutina'}
    </button>

    <div class="card mt-3">
      <div class="text-sm text-[var(--c-soft)] mb-2">Peso corporal (kg)</div>
      <div class="flex gap-2 mb-2">
        <input id="peso-input" type="number" inputmode="decimal" step="0.1" placeholder="Peso en kg" value="${pesoActual || ''}"
          class="flex-1 border border-[var(--c-pen)] rounded-lg px-3 py-1.5 text-sm bg-[var(--c-card)] text-[var(--c-text)] outline-none">
        <button id="save-peso" class="px-4 py-1.5 rounded-lg bg-[var(--c-pri)] text-white text-sm font-medium">Guardar</button>
      </div>
      ${pesosRecientes.length >= 2 ? `
        <div class="mt-2">${pesoChart(pesosRecientes)}</div>
      ` : pesosRecientes.length === 1 ? `
        <div class="text-xs text-[var(--c-soft)]">Último registro: ${pesosRecientes[0].peso} kg · Registra al menos 2 para ver gráfico</div>
      ` : `
        <div class="text-xs text-[var(--c-soft)]">Sin registros. Agrega tu peso para hacer seguimiento.</div>
      `}
    </div>

    <div class="fixed bottom-16 inset-x-0 max-w-md mx-auto px-4 py-2 bg-[var(--c-card)] border-t border-[var(--c-pen)] text-center text-sm text-[var(--c-text)]">
      ${hechos} de ${total} · ${pct}% ${rutinaOk ? '· Completada ✅' : ''}
    </div>
  `;

  mount.querySelectorAll('button[data-ex]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleEjercicio(fecha, btn.dataset.ex);
      render(mount, deps);
    });
  });

  mount.querySelectorAll('[data-tip]').forEach(el => {
    el.addEventListener('click', (ev) => {
      if (ev.target.closest('button[data-ex]')) return;
      tipAbierto = tipAbierto === el.dataset.tip ? null : el.dataset.tip;
      render(mount, deps);
    });
  });

  mount.querySelector('#completar').addEventListener('click', () => {
    completarRutina(fecha, !isRutinaCompletada(fecha));
    render(mount, deps);
  });

  const timerStart = mount.querySelector('#timer-start');
  if (timerStart) {
    timerStart.addEventListener('click', () => {
      if (timerInterval) { stopTimer(); render(mount, deps); }
      else { startTimer(timerTotal, render, mount, deps); }
    });
  }
  const timer60 = mount.querySelector('#timer-60');
  if (timer60) {
    timer60.addEventListener('click', () => {
      if (!timerInterval) { timerTotal = 60; timerSegundos = 0; render(mount, deps); }
    });
  }
  const timer90 = mount.querySelector('#timer-90');
  if (timer90) {
    timer90.addEventListener('click', () => {
      if (!timerInterval) { timerTotal = 90; timerSegundos = 0; render(mount, deps); }
    });
  }

  const savePeso = mount.querySelector('#save-peso');
  if (savePeso) {
    savePeso.addEventListener('click', () => {
      const input = mount.querySelector('#peso-input');
      if (input && input.value) {
        setPeso(fecha, input.value);
        render(mount, deps);
      }
    });
  }
}