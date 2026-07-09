import { getPerfilActivo } from './store.js';

const RUTAS = {
  '#selector': () => import('./views/selector.js').then(m => m.default),
  '#dashboard': () => import('./views/dashboard.js').then(m => m.default),
  '#alimentacion': () => import('./views/alimentacion.js').then(m => m.default),
  '#cuidado': () => import('./views/cuidado.js').then(m => m.default),
  '#ejercicio': () => import('./views/ejercicio.js').then(m => m.default),
  '#historial': () => import('./views/historial.js').then(m => m.default)
};

let deps = null;
export function setDeps(d) { deps = d; }

export function navigate(hash) {
  if (location.hash !== hash) location.hash = hash;
  else render();
}

export function initRouter() {
  window.addEventListener('hashchange', render);
  if (!location.hash) location.hash = '#selector';
  else render();
}

async function render() {
  const app = document.getElementById('app');
  app.classList.remove('fade-in');
  const hash = location.hash || '#selector';
  // Protección de perfil
  if (!getPerfilActivo() && hash !== '#selector') {
    location.hash = '#selector';
    return;
  }
  if (getPerfilActivo() && hash === '#selector') {
    location.hash = '#dashboard';
    return;
  }
  const loader = RUTAS[hash] || RUTAS['#dashboard'];
  try {
    const renderView = await loader();
    app.innerHTML = '';
    renderView(app, deps);
    void app.offsetWidth;
    app.classList.add('fade-in');
  } catch (e) {
    console.error('router: error renderizando', hash, e);
    app.innerHTML = '<p class="card text-red-500">Error al cargar la vista.</p>';
  }
}