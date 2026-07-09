import { COMIDAS, COMIDAS_LABEL, getComidaActual, getMenuReto, getMenuRetoFor, getOtroPerfil } from '../meals.js';
import { getEstadoReto } from '../challenge.js';
import { state, getComidas, toggleComida, getPerfilActivo, setComidaCustom, getComidaCustom, setGustico, getGustico, canUseGustico, countGusticosSemana } from '../store.js';

const DIAS_ORDEN = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

function hoyLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d - off * 60000).toISOString().slice(0, 10);
}

let comidaSel = null;
let menuPerfil = null;
let menuSemanalAbierto = false;
let editMode = false;
let customFoodIds = null;
let gusticoMode = false;
let gusticoState = { desc: '', kcal: '' };

function findFoodByName(name) {
  const q = name.toLowerCase().trim();
  if (!q) return null;
  return state.data.foods.alimentos.find(f => f.n.toLowerCase().includes(q)) || null;
}

function renderCustomFoods(fecha, comida) {
  const ids = getComidaCustom(fecha, comida);
  if (!ids) return '';
  const foods = state.data.foods.alimentos;
  return ids.map(id => {
    const f = foods.find(a => a.id === id);
    if (!f) return '';
    return `
      <li class="py-2 flex justify-between text-sm">
        <span class="text-[var(--c-ok)]">${f.n}</span>
        <span class="text-[var(--c-soft)]">${f.porcion} · ${f.kcal} kcal</span>
      </li>`;
  }).join('');
}

function renderMenuSemanal(menuPerfilId) {
  const menuData = state.data.menus.menus[menuPerfilId];
  return DIAS_ORDEN.map(dia => {
    const diaMenu = menuData[dia];
    const kcalDia = COMIDAS.reduce((acc, c) => acc + (diaMenu[c]?.kcalTotal || 0), 0);
    return `
      <div class="card">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm font-semibold text-[var(--c-text)] capitalize">${dia}</h3>
          <span class="text-xs text-[var(--c-soft)]">${kcalDia} kcal</span>
        </div>
        <div class="space-y-1.5">
          ${COMIDAS.map(c => {
            const m = diaMenu[c];
            return `
              <div class="flex justify-between items-start text-xs gap-2">
                <span class="text-[var(--c-soft)] shrink-0 w-20">${COMIDAS_LABEL[c]}</span>
                <span class="text-[var(--c-text)] flex-1">${m.plato}</span>
                <span class="text-[var(--c-soft)] shrink-0">${m.kcalTotal}</span>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');
}

function kcalFromIds(ids) {
  const foods = state.data.foods.alimentos;
  return ids.reduce((acc, id) => {
    const f = foods.find(a => a.id === id);
    return acc + (f ? f.kcal : 0);
  }, 0);
}

function findFoodId(ingName) {
  const foods = state.data.foods.alimentos;
  const name = ingName.toLowerCase();
  const m = foods.find(f => f.n.toLowerCase().includes(name.substring(0, 8)));
  return m ? m.id : null;
}

function initCustomFoodIds(fecha, comida, plato) {
  const stored = getComidaCustom(fecha, comida);
  if (stored) return [...stored];
  return (plato.ingredientes || []).map(ing => findFoodId(ing.i)).filter(Boolean);
}

function renderEditPanel(fecha, comida, plato) {
  const foods = state.data.foods.alimentos;
  const kcal = kcalFromIds(customFoodIds);
  const currentFoods = customFoodIds.map(id => foods.find(f => f.id === id)).filter(Boolean);

  return `
    <div class="card">
      <div class="text-sm font-medium text-[var(--c-text)] mb-2">Editar: ${COMIDAS_LABEL[comida]}</div>
      <div class="text-xs text-[var(--c-soft)] mb-3">Original: ${plato.plato}</div>
      <ul class="divide-y divide-[var(--c-pen)] mb-3">
        ${currentFoods.map((f, i) => `
          <li class="py-2 flex justify-between items-center text-sm">
            <div>
              <span class="text-[var(--c-text)]">${f.n}</span>
              <span class="text-[var(--c-soft)] ml-2 text-xs">${f.porcion} · ${f.kcal} kcal</span>
            </div>
            <button data-remove="${i}" class="text-[var(--c-soft)] hover:text-red-400 text-lg">&times;</button>
          </li>
        `).join('')}
        ${currentFoods.length === 0 ? '<li class="py-2 text-sm text-[var(--c-soft)]">Sin alimentos. Agrega uno abajo.</li>' : ''}
      </ul>
      <div class="flex gap-2 mb-2">
        <input id="add-food-input" type="text" list="foods-datalist" placeholder="Buscar alimento..." 
          class="flex-1 border border-[var(--c-pen)] rounded-lg px-3 py-1.5 text-sm bg-[var(--c-card)] text-[var(--c-text)] outline-none">
        <datalist id="foods-datalist">
          ${foods.map(f => `<option value="${f.n}">${f.kcal} kcal</option>`).join('')}
        </datalist>
        <button id="add-food-btn" class="px-4 py-1.5 rounded-lg btn-pri text-white text-sm font-medium">Agregar</button>
      </div>
      <div class="flex justify-between items-center mt-3 pt-3 border-t border-[var(--c-pen)]">
        <span class="text-sm font-semibold text-[var(--c-text)]">Total: ${kcal} kcal</span>
        <span class="text-xs text-[var(--c-soft)]">${currentFoods.length} alimentos</span>
      </div>
      <div class="flex gap-2 mt-3">
        <button id="save-edit" class="flex-1 py-2 rounded-xl text-sm font-medium btn-ok text-[var(--c-text)]">Guardar</button>
        <button id="cancel-edit" class="flex-1 py-2 rounded-xl text-sm font-medium bg-[var(--c-pen)] text-[var(--c-text)]">Cancelar</button>
      </div>
    </div>
  `;
}

function renderGusticoInput(fecha, comida, plato) {
  const counts = countGusticosSemana(fecha);
  return `
    <div class="card">
      <div class="text-sm font-medium text-[var(--c-text)] mb-2">Gustico: ${COMIDAS_LABEL[comida]}</div>
      <div class="text-xs text-[var(--c-soft)] mb-3">Original: ${plato.plato}</div>
      <div class="text-xs text-[var(--c-soft)] mb-2">Disponibles esta semana: ${2 - counts.principales} ppales, ${1 - counts.snacks} snacks</div>
      <input id="gustico-desc" type="text" placeholder="¿Qué comiste?" value="${gusticoState.desc}"
        class="w-full border border-[var(--c-pen)] rounded-lg px-3 py-1.5 text-sm bg-[var(--c-card)] text-[var(--c-text)] outline-none mb-2">
      <input id="gustico-kcal" type="number" inputmode="numeric" placeholder="Calorías" value="${gusticoState.kcal}"
        class="w-full border border-[var(--c-pen)] rounded-lg px-3 py-1.5 text-sm bg-[var(--c-card)] text-[var(--c-text)] outline-none mb-3">
      <div class="flex gap-2">
        <button id="save-gustico" class="flex-1 py-2 rounded-xl text-sm font-medium btn-ok text-[var(--c-text)]">Guardar gustico</button>
        <button id="cancel-gustico" class="flex-1 py-2 rounded-xl text-sm font-medium bg-[var(--c-pen)] text-[var(--c-text)]">Cancelar</button>
      </div>
    </div>
  `;
}

export default function render(mount, deps) {
  const fecha = hoyLocal();
  const retoDia = getEstadoReto().dia;
  const perfilActivo = getPerfilActivo();
  const otroPerfil = getOtroPerfil();
  if (!menuPerfil) menuPerfil = perfilActivo;

  const menuActivo = getMenuReto(retoDia) || {};
  const menu = menuPerfil === perfilActivo ? menuActivo : (getMenuRetoFor(retoDia, menuPerfil) || {});
  const marcadas = getComidas(fecha);
  if (!comidaSel || !COMIDAS.includes(comidaSel)) comidaSel = getComidaActual();
  const plato = menu[comidaSel] || { plato: '—', ingredientes: [], kcalTotal: 0 };
  const esPropio = menuPerfil === perfilActivo;
  const marcada = esPropio && marcadas.includes(comidaSel);

  const customKcal = esPropio && getComidaCustom(fecha, comidaSel)
    ? kcalFromIds(getComidaCustom(fecha, comidaSel))
    : null;
  const gustico = esPropio ? getGustico(fecha, comidaSel) : null;
  const gusticoKcal = gustico ? gustico.kcal : null;
  const puedeGustico = esPropio && !gustico && canUseGustico(fecha, comidaSel) && !customKcal;
  const overrideKcal = gusticoKcal != null ? gusticoKcal : customKcal;

  const kcalTotalDia = marcadas.reduce((acc, c) => {
    const g = getGustico(fecha, c);
    if (g) return acc + g.kcal;
    const custom = getComidaCustom(fecha, c);
    if (custom) return acc + kcalFromIds(custom);
    const menuC = menuActivo[c];
    return acc + (menuC?.kcalTotal || 0);
  }, 0);
  const kcalMax = state.data.config.objetivosDiarios.kcalMax;
  const kcalMin = state.data.config.objetivosDiarios.kcalMin;
  const nombreOtro = state.data.config.perfiles.find(p => p.id === otroPerfil)?.nombre || otroPerfil;

  if (editMode && !customFoodIds) {
    customFoodIds = initCustomFoodIds(fecha, comidaSel, plato);
  }

  mount.innerHTML = `
    <header class="mb-3 flex justify-between items-center">
      <h2 class="text-lg text-[var(--c-text)]">Alimentación · Día ${retoDia}</h2>
      <button id="toggle-menu" class="px-3 py-1.5 rounded-xl text-xs font-medium btn-accent text-[var(--c-text)]">
        ${esPropio ? 'Mi menú' : nombreOtro}
      </button>
    </header>
    <div class="tab-scroll mb-3">
      ${COMIDAS.map(c => `
        <button data-comida="${c}" class="px-2 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap ${comidaSel === c ? 'btn-pri text-white' : 'bg-[var(--c-card)] text-[var(--c-soft)] border border-[var(--c-pen)]'}">
          ${COMIDAS_LABEL[c]}${esPropio && marcadas.includes(c) ? ' ✓' : ''}
        </button>
      `).join('')}
    </div>

    ${!esPropio ? `<div class="card text-center text-sm text-[var(--c-soft)] mb-3">Viendo menú de ${nombreOtro}</div>` : ''}

    ${editMode && esPropio ? renderEditPanel(fecha, comidaSel, plato) :
      gusticoMode && esPropio ? renderGusticoInput(fecha, comidaSel, plato) : `
      <div class="card">
        <div class="flex justify-between items-start">
          <h3 class="font-semibold text-[var(--c-text)] ${overrideKcal != null ? 'line-through opacity-60' : ''}">${plato.plato}</h3>
          <span class="rounded-full px-3 py-1 text-sm btn-accent text-[var(--c-text)]">${overrideKcal != null ? overrideKcal : plato.kcalTotal} kcal</span>
        </div>
        ${gustico ? `
          <div class="text-xs text-[var(--c-soft)] mt-2 mb-1">Gustico:</div>
          <div class="py-2 flex justify-between text-sm">
            <span class="text-[var(--c-accent)]">${gustico.desc}</span>
            <span class="text-[var(--c-soft)]">${gustico.kcal} kcal</span>
          </div>
          <button id="remove-gustico" class="mt-2 w-full py-2 rounded-xl text-sm font-medium bg-[var(--c-pen)] text-[var(--c-text)]">Quitar gustico</button>
        ` : customKcal != null ? `
          <div class="text-xs text-[var(--c-soft)] mt-2 mb-1">Reemplazado por:</div>
          <ul class="divide-y divide-[var(--c-pen)]">
            ${renderCustomFoods(fecha, comidaSel)}
          </ul>
        ` : `
          <ul class="mt-3 divide-y divide-[var(--c-pen)]">
            ${(plato.ingredientes || []).map(ing => `
              <li class="py-2 flex justify-between text-sm">
                <span class="text-[var(--c-text)]">${ing.i}</span>
                <span class="text-[var(--c-soft)]">${ing.cantidad} · ${ing.kcal} kcal</span>
              </li>
            `).join('')}
          </ul>
        `}
        ${esPropio ? `
          <button id="toggle-comida" class="mt-3 w-full py-2 rounded-xl font-medium ${marcada ? 'btn-ok text-[var(--c-text)]' : 'btn-pri text-white'}">
            ${marcada ? 'Comida consumida ✓' : 'Marcar como consumida'}
          </button>
          ${!gustico ? `
            <button id="edit-comida" class="mt-2 w-full py-2 rounded-xl text-sm font-medium border border-[var(--c-pen)] bg-[var(--c-card)] text-[var(--c-text)]">
              Editar alimentos
            </button>
          ` : ''}
          ${puedeGustico ? `
            <button id="gustico-btn" class="mt-2 w-full py-2 rounded-xl text-sm font-medium border border-[var(--c-accent)] bg-[var(--c-card)] text-[var(--c-accent)]">
              Gustico
            </button>
          ` : ''}
        ` : `
          <div class="mt-3 py-2 text-center text-sm text-[var(--c-soft)]">Solo puedes marcar comidas de tu propio menú</div>
        `}
      </div>
    `}

    <button id="toggle-semanal" class="w-full py-2.5 rounded-xl text-sm font-medium bg-[var(--c-pen)] text-[var(--c-text)] mt-2">
      ${menuSemanalAbierto ? 'Ocultar menú semanal ▲' : 'Ver menú semanal ▼'}
    </button>
    ${menuSemanalAbierto ? `<div id="menu-semanal" class="mt-2 space-y-2">${renderMenuSemanal(menuPerfil)}</div>` : ''}

    <div class="fixed bottom-16 inset-x-0 max-w-md mx-auto px-4 py-2 bg-[var(--c-card)] border-t border-[var(--c-pen)] flex justify-between text-sm text-[var(--c-text)]">
      <span>Calorías del día</span>
      <span><b>${kcalTotalDia}</b> / ${kcalMin}-${kcalMax} kcal</span>
    </div>
  `;

  mount.querySelectorAll('button[data-comida]').forEach(btn => {
    btn.addEventListener('click', () => {
      comidaSel = btn.dataset.comida;
      editMode = false; customFoodIds = null;
      gusticoMode = false; gusticoState = { desc: '', kcal: '' };
      render(mount, deps);
    });
  });

  const toggleMenu = mount.querySelector('#toggle-menu');
  if (toggleMenu) {
    toggleMenu.addEventListener('click', () => {
      menuPerfil = menuPerfil === perfilActivo ? otroPerfil : perfilActivo;
      render(mount, deps);
    });
  }

  const toggleBtn = mount.querySelector('#toggle-comida');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      toggleComida(fecha, comidaSel);
      render(mount, deps);
    });
  }

  const editComida = mount.querySelector('#edit-comida');
  if (editComida) {
    editComida.addEventListener('click', () => {
      editMode = true;
      customFoodIds = initCustomFoodIds(fecha, comidaSel, plato);
      render(mount, deps);
    });
  }

  const gusticoBtn = mount.querySelector('#gustico-btn');
  if (gusticoBtn) {
    gusticoBtn.addEventListener('click', () => {
      gusticoMode = true;
      gusticoState = { desc: '', kcal: '' };
      render(mount, deps);
    });
  }

  const saveGustico = mount.querySelector('#save-gustico');
  if (saveGustico) {
    saveGustico.addEventListener('click', () => {
      const desc = mount.querySelector('#gustico-desc')?.value || '';
      const kcal = mount.querySelector('#gustico-kcal')?.value || '0';
      setGustico(fecha, comidaSel, desc, kcal);
      gusticoMode = false;
      gusticoState = { desc: '', kcal: '' };
      render(mount, deps);
    });
  }

  const cancelGustico = mount.querySelector('#cancel-gustico');
  if (cancelGustico) {
    cancelGustico.addEventListener('click', () => {
      gusticoMode = false;
      gusticoState = { desc: '', kcal: '' };
      render(mount, deps);
    });
  }

  const removeGustico = mount.querySelector('#remove-gustico');
  if (removeGustico) {
    removeGustico.addEventListener('click', () => {
      setGustico(fecha, comidaSel, null, null);
      render(mount, deps);
    });
  }

  const addBtn = mount.querySelector('#add-food-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const input = mount.querySelector('#add-food-input');
      if (!input) return;
      const food = findFoodByName(input.value);
      if (food && !customFoodIds.includes(food.id)) {
        customFoodIds.push(food.id);
      }
      input.value = '';
      render(mount, deps);
    });
  }

  mount.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      customFoodIds.splice(parseInt(btn.dataset.remove), 1);
      render(mount, deps);
    });
  });

  const saveEdit = mount.querySelector('#save-edit');
  if (saveEdit) {
    saveEdit.addEventListener('click', () => {
      setComidaCustom(fecha, comidaSel, customFoodIds);
      editMode = false;
      customFoodIds = null;
      render(mount, deps);
    });
  }

  const cancelEdit = mount.querySelector('#cancel-edit');
  if (cancelEdit) {
    cancelEdit.addEventListener('click', () => {
      editMode = false;
      customFoodIds = null;
      render(mount, deps);
    });
  }

  const toggleSemanal = mount.querySelector('#toggle-semanal');
  if (toggleSemanal) {
    toggleSemanal.addEventListener('click', () => {
      menuSemanalAbierto = !menuSemanalAbierto;
      render(mount, deps);
    });
  }
}