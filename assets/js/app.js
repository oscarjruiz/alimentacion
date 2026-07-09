import * as store from './store.js';
import * as challenge from './challenge.js';
import * as meals from './meals.js';
import { initRouter, setDeps, navigate } from './router.js';

async function main() {
  const [config, menus, routines, habits] = await Promise.all([
    fetch('assets/data/config.json').then(r => r.json()),
    fetch('assets/data/menus.json').then(r => r.json()),
    fetch('assets/data/routines.json').then(r => r.json()),
    fetch('assets/data/habits.json').then(r => r.json())
  ]);
  store.state.data = { config, menus, routines, habits };
  store.init(config.perfiles);
  store.state.perfil = store.getPerfilActivo();
  setDeps({ store, challenge, meals, router: { navigate } });
  initRouter();
}

window.addEventListener('DOMContentLoaded', main);