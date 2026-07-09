import { state } from './store.js';

const TOTAL = 90;

function hoyLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d - off * 60000).toISOString().slice(0, 10);
}

export function getEstadoReto() {
  const inicio = new Date(state.data.config.fechaInicio + 'T00:00:00');
  const hoy = new Date(hoyLocal() + 'T00:00:00');
  const diffDias = Math.floor((hoy - inicio) / 86400000);
  let estado, dia, restante, fase;
  if (diffDias < 0) {
    estado = 'futuro';
    dia = 0;
    restante = TOTAL;
    fase = `Comienza en ${-diffDias} días`;
  } else if (diffDias >= TOTAL) {
    estado = 'completado';
    dia = TOTAL;
    restante = 0;
    fase = 'Reto completado';
  } else {
    estado = 'enCurso';
    dia = diffDias + 1;
    restante = TOTAL - dia + 1;
    fase = `Día ${dia} de ${TOTAL} · quedan ${restante - 1} días`;
  }
  return { dia, total: TOTAL, totalRestante: restante, estado, fase };
}

export function diaDelRetoParaFecha(fecha) {
  const inicio = new Date(state.data.config.fechaInicio + 'T00:00:00');
  const f = new Date(fecha + 'T00:00:00');
  const diff = Math.floor((f - inicio) / 86400000) + 1;
  return diff;
}