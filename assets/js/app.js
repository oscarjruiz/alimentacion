import * as store from './store.js';
import * as challenge from './challenge.js';
import * as meals from './meals.js';
import { initRouter, setDeps, navigate } from './router.js';

async function main() {
  const app = document.getElementById('app');
  let datos;
  try {
    const [config, menus, routines, habits, foods] = await Promise.all([
      fetch('assets/data/config.json').then(r => { if (!r.ok) throw new Error('config.json'); return r.json(); }),
      fetch('assets/data/menus.json').then(r => { if (!r.ok) throw new Error('menus.json'); return r.json(); }),
      fetch('assets/data/routines.json').then(r => { if (!r.ok) throw new Error('routines.json'); return r.json(); }),
      fetch('assets/data/habits.json').then(r => { if (!r.ok) throw new Error('habits.json'); return r.json(); }),
      fetch('assets/data/foods.json').then(r => { if (!r.ok) throw new Error('foods.json'); return r.json(); })
    ]);
    datos = { config, menus, routines, habits, foods };
  } catch (e) {
    app.innerHTML = `<div class="card text-center text-[var(--c-text)] mt-10">
      <p class="text-lg mb-2">Error cargando datos</p>
      <p class="text-sm text-[var(--c-soft)]">Verifica que el archivo <code>${e.message}</code> exista y sirva el sitio vía HTTP (no file://).</p>
    </div>`;
    return;
  }
  store.state.data = datos;
  store.init(datos.config.perfiles);
  store.state.perfil = store.getPerfilActivo();
  setDeps({ store, challenge, meals, router: { navigate } });
  initRouter();
}

window.addEventListener('DOMContentLoaded', main);
