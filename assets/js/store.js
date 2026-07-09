const KEY = 'reto90_nutricion';
const VERSION = 1;

export const state = { data: null, perfil: null, storage: null };

function loadStorage() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn('store: parse falló, reiniciando', e); }
  return null;
}

function saveStorage() {
  localStorage.setItem(KEY, JSON.stringify(state.storage));
}

function emptyPerfile() {
  return { comidas: {}, habitos: {}, ejercicios: {}, rutinaCompletada: {}, objetivos: {} };
}

export function init(perfiles) {
  state.storage = loadStorage();
  if (!state.storage || state.storage.version !== VERSION) {
    state.storage = { version: VERSION, perfilActivo: null, perfiles: {} };
    for (const p of perfiles) {
      state.storage.perfiles[p.id] = { nombre: p.nombre, ...emptyPerfile() };
    }
  }
  state.perfil = state.storage.perfilActivo || null;
  saveStorage();
}

function ensurePerfilFecha(perfilId, fecha) {
  const p = state.storage.perfiles[perfilId];
  if (!p.comidas[fecha]) p.comidas[fecha] = [];
  if (!p.habitos[fecha]) p.habitos[fecha] = [];
  if (!p.ejercicios[fecha]) p.ejercicios[fecha] = [];
  if (p.rutinaCompletada[fecha] === undefined) p.rutinaCompletada[fecha] = false;
  if (!p.objetivos[fecha]) p.objetivos[fecha] = { agua: 0, pasos: 0 };
  return p;
}

export function getPerfilActivo() { return state.perfil; }

export function setPerfil(id) {
  state.storage.perfilActivo = id;
  state.perfil = id;
  saveStorage();
}

function curFecha() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d - off * 60000).toISOString().slice(0, 10);
}

function toggleArray(arr, val) {
  const i = arr.indexOf(val);
  if (i === -1) arr.push(val); else arr.splice(i, 1);
}

export function toggleComida(fecha, comida) {
  const p = ensurePerfilFecha(state.perfil, fecha);
  toggleArray(p.comidas[fecha], comida);
  saveStorage();
}

export function toggleHabito(fecha, id) {
  const p = ensurePerfilFecha(state.perfil, fecha);
  toggleArray(p.habitos[fecha], id);
  saveStorage();
}

export function sumarAgua(fecha, delta) {
  const p = ensurePerfilFecha(state.perfil, fecha);
  const v = (p.objetivos[fecha].agua || 0) + delta;
  p.objetivos[fecha].agua = Math.max(0, Math.min(8, v));
  saveStorage();
}

export function setPasos(fecha, n) {
  const p = ensurePerfilFecha(state.perfil, fecha);
  p.objetivos[fecha].pasos = Math.max(0, Math.min(99999, n | 0));
  saveStorage();
}

export function toggleEjercicio(fecha, exId) {
  const p = ensurePerfilFecha(state.perfil, fecha);
  toggleArray(p.ejercicios[fecha], exId);
  const total = state.data.routines.rutinas[challengeDiaFromFecha(fecha) - 1].ejercicios.length;
  if (p.ejercicios[fecha].length >= total) p.rutinaCompletada[fecha] = true;
  else p.rutinaCompletada[fecha] = false;
  saveStorage();
}

export function completarRutina(fecha, val) {
  const p = ensurePerfilFecha(state.perfil, fecha);
  p.rutinaCompletada[fecha] = val;
  if (val) {
    const rut = state.data.routines.rutinas[challengeDiaFromFecha(fecha) - 1];
    p.ejercicios[fecha] = rut.ejercicios.map(e => e.id);
  } else {
    p.ejercicios[fecha] = [];
  }
  saveStorage();
}

export function getComidas(fecha) { return state.storage.perfiles[state.perfil]?.comidas[fecha] || []; }
export function getHabitos(fecha) { return state.storage.perfiles[state.perfil]?.habitos[fecha] || []; }
export function getEjercicios(fecha) { return state.storage.perfiles[state.perfil]?.ejercicios[fecha] || []; }
export function isRutinaCompletada(fecha) { return !!state.storage.perfiles[state.perfil]?.rutinaCompletada[fecha]; }
export function getAgua(fecha) { return state.storage.perfiles[state.perfil]?.objetivos[fecha]?.agua || 0; }
export function getPasos(fecha) { return state.storage.perfiles[state.perfil]?.objetivos[fecha]?.pasos || 0; }

export function getPerfilFecha(fecha) {
  const p = state.storage.perfiles[state.perfil];
  if (!p) return null;
  ensurePerfilFecha(state.perfil, fecha);
  return {
    comidas: p.comidas[fecha],
    habitos: p.habitos[fecha],
    ejercicios: p.ejercicios[fecha],
    rutinaCompletada: p.rutinaCompletada[fecha],
    agua: p.objetivos[fecha].agua,
    pasos: p.objetivos[fecha].pasos
  };
}

function challengeDiaFromFecha(fecha) {
  const inicio = new Date(state.data.config.fechaInicio + 'T00:00:00');
  const f = new Date(fecha + 'T00:00:00');
  const diff = Math.floor((f - inicio) / 86400000) + 1;
  return diff;
}