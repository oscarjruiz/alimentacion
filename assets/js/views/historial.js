import { getEstadoReto, diaDelRetoParaFecha } from '../challenge.js';
import { getMenuReto } from '../meals.js';
import { state, getPerfilFecha } from '../store.js';

function fmt(d) {
  const off = d.getTimezoneOffset();
  return new Date(d - off * 60000).toISOString().slice(0, 10);
}

function ultimos7() {
  const hoy = new Date();
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(hoy.getTime() - i * 86400000);
    out.push(fmt(d));
  }
  return out;
}

let diaSel = null;

function resumenDia(fecha, challenge) {
  const diaReto = diaDelRetoParaFecha(fecha);
  if (diaReto < 1 || diaReto > 90) return null;
  const p = getPerfilFecha(fecha);
  const menu = getMenuReto(diaReto) || {};
  const kcal = (p?.comidas || []).reduce((acc, c) => acc + (menu[c]?.kcalTotal || 0), 0);
  const habitos = state.data.habits.habitos;
  const aguaObj = state.data.config.objetivosDiarios.aguaVasos;
  const habComp = habitos.filter(h => h.id === 'hidratacion' ? (p?.agua || 0) >= aguaObj : (p?.habitos || []).includes(h.id)).length;
  const rutina = state.data.routines.rutinas[diaReto - 1];
  return { diaReto, kcal, comidas: p.comidas.length, habComp, habTotal: habitos.length, rutinaOk: p.rutinaCompletada, rutinaNombre: rutina?.nombre, ejercicios: p.ejercicios, menu, comidasMarcadas: p.comidas };
}

function graficoBarras(dias) {
  const data = dias.map(f => {
    const r = resumenDia(f);
    return { f, kcal: r ? r.kcal : 0 };
  });
  const maxKcal = Math.max(...data.map(d => d.kcal), state.data.config.objetivosDiarios.kcalMax, 1);
  const w = 240, h = 80, barW = 30, gap = 6;
  const yScale = h / maxKcal;
  let svg = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" fill="none">`;
  data.forEach((d, i) => {
    const x = i * (barW + gap);
    const bh = Math.max(2, d.kcal * yScale);
    svg += `<rect x="${x}" y="${h - bh}" width="${barW}" height="${bh}" rx="3" fill="${state.data.config.objetivosDiarios.kcalMin <= d.kcal && d.kcal <= state.data.config.objetivosDiarios.kcalMax ? '#B5E8C9' : '#A7C7E7'}"/>`;
  });
  svg += '</svg>';
  return svg;
}

function contadorRutinas() {
  let count = 0;
  const inicio = new Date(state.data.config.fechaInicio + 'T00:00:00');
  for (let d = 1; d <= 90; d++) {
    const f = fmt(new Date(inicio.getTime() + (d - 1) * 86400000));
    if (getPerfilFecha(f)?.rutinaCompletada) count++;
  }
  return count;
}

function adherencia() {
  let totalChecks = 0, totalPosibles = 0;
  const inicio = new Date(state.data.config.fechaInicio + 'T00:00:00');
  const reto = getEstadoReto();
  const hasta = Math.min(reto.dia, 90);
  for (let d = 1; d <= hasta; d++) {
    const f = fmt(new Date(inicio.getTime() + (d - 1) * 86400000));
    const p = getPerfilFecha(f);
    totalPosibles += 1;
    if (p?.rutinaCompletada) totalChecks += 1;
  }
  return totalPosibles > 0 ? Math.round(totalChecks / totalPosibles * 100) : 0;
}

export default function render(mount, deps) {
  const dias = ultimos7();
  if (!diaSel || !dias.includes(diaSel)) diaSel = dias[0];
  const resumen = resumenDia(diaSel, getEstadoReto());

  mount.innerHTML = `
    <header class="mb-3 flex justify-between items-center">
      <h2 class="text-lg text-[#3A4A5C]">Historial</h2>
      <a href="#dashboard" class="text-sm text-[#A7C7E7]">Volver</a>
    </header>
    <div class="tab-scroll mb-3">
      ${dias.map(f => `
        <button data-fecha="${f}" class="px-3 py-1.5 rounded-xl text-xs whitespace-nowrap ${diaSel === f ? 'bg-[#A7C7E7] text-white' : 'bg-white text-[#7A8A9A] border border-[#E0E8F0]'}">${f.slice(5)}</button>
      `).join('')}
    </div>
    ${resumen ? `
      <div class="grid grid-cols-2 gap-2 mb-3">
        <div class="card"><div class="text-xs text-[#7A8A9A]">Calorías</div><div class="text-lg">${resumen.kcal}</div></div>
        <div class="card"><div class="text-xs text-[#7A8A9A]">Comidas</div><div class="text-lg">${resumen.comidas}/5</div></div>
        <div class="card"><div class="text-xs text-[#7A8A9A]">Hábitos</div><div class="text-lg">${resumen.habComp}/${resumen.habTotal}</div></div>
        <div class="card"><div class="text-xs text-[#7A8A9A]">Rutina</div><div class="text-lg">${resumen.rutinaOk ? '✅' : '⬜'}</div></div>
      </div>
      <div class="card">
        <div class="text-sm font-medium mb-2">Detalle del día ${resumen.diaReto}</div>
        <div class="text-xs text-[#7A8A9A] mb-1">Comidas: ${resumen.comidasMarcadas.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ') || 'ninguna'}</div>
        <div class="text-xs text-[#7A8A9A]">Rutina: ${resumen.rutinaNombre || '—'} ${resumen.ejercicios.length > 0 ? '(' + resumen.ejercicios.length + ' ejercicios)' : ''}</div>
      </div>
    ` : `<div class="card text-sm text-[#7A8A9A]">Día fuera del reto.</div>`}

    <h3 class="text-sm text-[#7A8A9A] mt-4 mb-2">Calorías últimos 7 días</h3>
    <div class="card">${graficoBarras(dias)}</div>

    <div class="card flex justify-between"><span class="text-sm text-[#7A8A9A]">Rutinas completadas</span><span class="font-medium">${contadorRutinas()} / 90</span></div>
    <div class="card flex justify-between"><span class="text-sm text-[#7A8A9A]">Adherencia general</span><span class="font-medium">${adherencia()}%</span></div>
  `;

  mount.querySelectorAll('button[data-fecha]').forEach(btn => {
    btn.addEventListener('click', () => { diaSel = btn.dataset.fecha; render(mount, deps); });
  });
}