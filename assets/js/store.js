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
  return { comidas: {}, comidasCustom: {}, gusticos: {}, habitos: {}, ejercicios: {}, rutinaCompletada: {}, objetivos: {} };
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
  if (!p.comidasCustom) p.comidasCustom = {};
  if (!p.comidasCustom[fecha]) p.comidasCustom[fecha] = {};
  if (!p.gusticos) p.gusticos = {};
  if (!p.gusticos[fecha]) p.gusticos[fecha] = {};
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
  p.objetivos[fecha].agua = Math.max(0, Math.min(state.data.config.objetivosDiarios.aguaVasos, v));
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

export function setComidaCustom(fecha, comida, foodIds) {
  const p = ensurePerfilFecha(state.perfil, fecha);
  if (!foodIds || foodIds.length === 0) {
    delete p.comidasCustom[fecha][comida];
  } else {
    p.comidasCustom[fecha][comida] = foodIds;
  }
  saveStorage();
}

export function getComidaCustom(fecha, comida) {
  const p = state.storage.perfiles[state.perfil];
  if (!p || !p.comidasCustom) return null;
  return p.comidasCustom[fecha]?.[comida] || null;
}

function getWeekKey(fecha) {
  const d = new Date(fecha + 'T00:00:00');
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return monday.toISOString().slice(0, 10);
}

const PRINCIPALES = ['desayuno', 'almuerzo', 'comida'];
const SNACKS = ['mediasNueves', 'onces'];

export function setGustico(fecha, comida, desc, kcal) {
  const p = ensurePerfilFecha(state.perfil, fecha);
  if (!desc || !kcal) {
    delete p.gusticos[fecha][comida];
  } else {
    p.gusticos[fecha][comida] = { desc, kcal: parseInt(kcal) || 0 };
  }
  saveStorage();
}

export function getGustico(fecha, comida) {
  const p = state.storage.perfiles[state.perfil];
  if (!p || !p.gusticos) return null;
  return p.gusticos[fecha]?.[comida] || null;
}

export function countGusticosSemana(fecha) {
  const p = state.storage.perfiles[state.perfil];
  if (!p || !p.gusticos) return { principales: 0, snacks: 0 };
  const wk = getWeekKey(fecha);
  let prin = 0, snk = 0;
  for (const f of Object.keys(p.gusticos)) {
    if (getWeekKey(f) !== wk) continue;
    for (const c of Object.keys(p.gusticos[f])) {
      if (PRINCIPALES.includes(c)) prin++;
      else if (SNACKS.includes(c)) snk++;
    }
  }
  return { principales: prin, snacks: snk };
}

export function canUseGustico(fecha, comida) {
  const counts = countGusticosSemana(fecha);
  if (PRINCIPALES.includes(comida)) return counts.principales < 2;
  if (SNACKS.includes(comida)) return counts.snacks < 1;
  return false;
}

export function setPeso(fecha, peso) {
  const p = ensurePerfilFecha(state.perfil, fecha);
  if (!p.peso) p.peso = {};
  p.peso[fecha] = parseFloat(peso) || 0;
  saveStorage();
}

export function getPeso(fecha) {
  const p = state.storage.perfiles[state.perfil];
  if (!p || !p.peso) return null;
  return p.peso[fecha] || null;
}

export function getPesosRecientes(dias) {
  const p = state.storage.perfiles[state.perfil];
  if (!p || !p.peso) return [];
  const hoy = new Date();
  const result = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoy.getTime() - i * 86400000);
    const off = d.getTimezoneOffset();
    const f = new Date(d - off * 60000).toISOString().slice(0, 10);
    const v = p.peso[f];
    if (v) result.push({ fecha: f, peso: v });
  }
  return result;
}

export function getRacha() {
  const p = state.storage.perfiles[state.perfil];
  if (!p) return 0;
  const hoy = new Date();
  let racha = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date(hoy.getTime() - i * 86400000);
    const off = d.getTimezoneOffset();
    const f = new Date(d - off * 60000).toISOString().slice(0, 10);
    if (p.rutinaCompletada[f]) racha++;
    else break;
  }
  return racha;
}

function challengeDiaFromFecha(fecha) {
  const inicio = new Date(state.data.config.fechaInicio + 'T00:00:00');
  const f = new Date(fecha + 'T00:00:00');
  const diff = Math.floor((f - inicio) / 86400000) + 1;
  return diff;
}