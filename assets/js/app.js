import * as store from './store.js';
import { initRouter, setDeps } from './router.js';
fetch('assets/data/config.json').then(r=>r.json()).then(cfg => {
  store.state.data = { config: cfg };
  store.init(cfg.perfiles);
  setDeps({ store });
  initRouter();
});