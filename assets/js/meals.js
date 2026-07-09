import { state } from './store.js';

export const COMIDAS = ['desayuno', 'mediasNueves', 'almuerzo', 'onces', 'comida'];
export const COMIDAS_LABEL = {
  desayuno: 'Desayuno',
  mediasNueves: 'Medias Nueves',
  almuerzo: 'Almuerzo',
  onces: 'Onces',
  comida: 'Comida'
};

const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

export function getComidaActual() {
  const h = new Date().getHours();
  if (h >= 6 && h < 10) return 'desayuno';
  if (h >= 10 && h < 12.5) return 'mediasNueves';
  if (h >= 12.5 && h < 15) return 'almuerzo';
  if (h >= 15 && h < 18) return 'onces';
  if (h >= 18 && h < 22) return 'comida';
  return 'desayuno';
}

export function getDiaSemanaForFecha(fecha) {
  const d = new Date(fecha + 'T00:00:00');
  return DIAS[d.getDay()];
}

export function getDiaSemanaForReto(diaReto) {
  const inicio = new Date(state.data.config.fechaInicio + 'T00:00:00');
  const fecha = new Date(inicio.getTime() + (diaReto - 1) * 86400000);
  return DIAS[fecha.getDay()];
}

export function getMenu(fecha) {
  const perfil = state.perfil;
  const diaSem = getDiaSemanaForFecha(fecha);
  return state.data.menus.menus[perfil][diaSem];
}

export function getMenuReto(diaReto) {
  const perfil = state.perfil;
  const diaSem = getDiaSemanaForReto(diaReto);
  return state.data.menus.menus[perfil][diaSem];
}