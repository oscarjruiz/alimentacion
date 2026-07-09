# Sistema de Gestión de Nutrición y Bienestar Personal (Reto 90 Días) — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una SPA Vanilla (HTML/JS + Tailwind CDN) para gestionar alimentación, cuidado personal y ejercicio de dos perfiles (OSCAR, SHARON) durante un reto de 90 días, con estado persistente en LocalStorage y despliegue estático.

**Architecture:** SPA con hash routing. Un `index.html`, módulos ES en `assets/js/`, datos estáticos en `assets/data/*.json` cargados via `fetch`. `store.js` encapsula persistencia en LocalStorage (clave `reto90_nutricion`). Sin build, sin npm, sin backend.

**Tech Stack:** Vanilla JS (ES modules), HTML5, Tailwind CSS via CDN (`https://cdn.tailwindcss.com`), Google Fonts (Inter), LocalStorage.

## Global Constraints

- Sin build ni npm: Tailwind via CDN, JS via `<script type="module">`. Los datos se cargan con `fetch` (requiere servir los archivos via HTTP local, no `file://`).
- Paleta pastel gama fría (variables CSS en `assets/css/styles.css`): fondo `#F5F7FA`, tarjetas `#FFFFFF`, primario `#A7C7E7`, secundario `#B5E8C9`, acento `#D4C5F9`, texto `#3A4A5C`, texto secundario `#7A8A9A`, éxito `#B5E8C9`, pendiente `#E0E8F0`.
- Tipografía: Inter via Google Fonts. Pesos 400 (body), 500 (botones), 600 (títulos).
- Dos perfiles fijos sin etiquetas de dieta en la UI: `oscar` (OSCAR) y `sharon` (SHARON).
- Las 5 comidas por día, keys exactas: `desayuno`, `mediasNueves`, `almuerzo`, `onces`, `comida`.
- Fecha de inicio global en `config.json`: `"2026-07-09"`. Cuenta regresiva de 90 días.
- Objetivo calórico rango: `kcalMin: 1050`, `kcalMax: 1350`.
- LocalStorage key única: `reto90_nutricion`. Versión `1`.
- Fechas en formato `YYYY-MM-DD` con huso horario local del dispositivo.
- Testing: manual (sin framework). Cada verificación abre `index.html` en navegador (usar servidor HTTP local como `python -m http.server` desde la raíz) y observa comportamiento/consola.
- Commits frecuentes por tarea con prefijo `feat:`, `chore:`, `fix:` según corresponda.
- Mobile-first: contenedor `max-w-md mx-auto`, tab-bar inferior fija con 4 ítems.
- El repositorio ya es git. Working dir: `C:\Users\oscar\Documents\Projects\pagina-alimentacion`.

---

## File Structure

| Archivo | Responsabilidad |
|---------|-----------------|
| `index.html` | Punto de entrada SPA. Carga Tailwind, fonts, CSS, monta `<div id="app">` y `<nav>` tab-bar. Importa `app.js` como module. |
| `assets/css/styles.css` | Variables de paleta, reglas custom (transiciones, scroll de tabs, gráfico SVG). |
| `assets/js/app.js` | Orquestador. Carga datos JSON en paralelo, los guarda en `state.data`, inicializa store + router, render inicial. |
| `assets/js/router.js` | Escucha `hashchange`, mapea hash → vista, valida perfil, monta vista en `#app`. |
| `assets/js/store.js` | Estado global + persistencia LocalStorage. API de mutación y lectura. |
| `assets/js/challenge.js` | Cálculo del día del reto, cuenta regresiva, casos borde (futura/pasada). |
| `assets/js/meals.js` | `getComidaActual()` por horario, mapeo día del reto → día de semana → menú. |
| `assets/js/views/selector.js` | Render selector de perfil. |
| `assets/js/views/dashboard.js` | Render dashboard con métricas + resumen de 3 secciones. |
| `assets/js/views/alimentacion.js` | Render vista alimentación con tabs de comida. |
| `assets/js/views/cuidado.js` | Render hábitos + widget agua. |
| `assets/js/views/ejercicio.js` | Render rutina + ejercicios + completar. |
| `assets/js/views/historial.js` | Render historial por día + gráfico SVG + progreso reto. |
| `assets/data/config.json` | fechaInicio, objetivosDiarios, perfiles. |
| `assets/data/menus.json` | Menús semanales paralelos para oscar y sharon (7 días × 5 comidas). |
| `assets/data/routines.json` | 90 rutinas (una por día del reto). |
| `assets/data/habits.json` | Lista fija de 6 hábitos diarios. |

**Estado compartido entre módulos:** `store.js` expone `state` (objeto con `data` cargado y `perfil` activo) y funciones de mutación. `router.js` expone `navigate(hash)`. Las vistas reciben deps inyectadas desde `app.js` (store, router, challenge, meals, datos).

---

### Task 1: Scaffold del proyecto + index.html + estilos base

**Files:**
- Create: `index.html`
- Create: `assets/css/styles.css`
- Create: `assets/js/app.js` (stub mínimo)

**Interfaces:**
- Produces: `index.html` con `<div id="app">` y tab-bar; `assets/css/styles.css` con variables de paleta; `app.js` stub que escribe saludo en `#app`.

- [ ] **Step 1: Crear `assets/css/styles.css` con variables y utilidades**

```css
:root {
  --color-bg: #F5F7FA;
  --color-card: #FFFFFF;
  --color-primary: #A7C7E7;
  --color-secondary: #B5E8C9;
  --color-accent: #D4C5F9;
  --color-text: #3A4A5C;
  --color-text-soft: #7A8A9A;
  --color-success: #B5E8C9;
  --color-pending: #E0E8F0;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 400;
  padding-bottom: 4rem; /* espacio para tab-bar fija */
  -webkit-text-size-adjust: 100%;
}

h1, h2, h3 { font-weight: 600; margin: 0; }

.app-container { max-width: 28rem; margin: 0 auto; padding: 1rem; }

.card {
  background: var(--color-card);
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(58,74,92,0.08);
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.fade-in { animation: fadeIn 0.18s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.tab-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.25rem;
}
.tab-scroll::-webkit-scrollbar { display: none; }

.progress-bar {
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--color-pending);
  overflow: hidden;
}
.progress-bar > span {
  display: block;
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}
```

- [ ] **Step 2: Crear `index.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reto 90 Días — Nutrición y Bienestar</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
  <div class="app-container">
    <div id="app"></div>
  </div>

  <nav class="fixed bottom-0 inset-x-0 bg-white border-t border-[#E0E8F0] flex justify-around py-2 text-xs text-[#7A8A9A] z-10">
    <a href="#dashboard" class="flex flex-col items-center gap-0.5">
      <span class="text-lg">🏠</span><span>Inicio</span>
    </a>
    <a href="#alimentacion" class="flex flex-col items-center gap-0.5">
      <span class="text-lg">🍽️</span><span>Alimentación</span>
    </a>
    <a href="#cuidado" class="flex flex-col items-center gap-0.5">
      <span class="text-lg">🌿</span><span>Cuidado</span>
    </a>
    <a href="#ejercicio" class="flex flex-col items-center gap-0.5">
      <span class="text-lg">💪</span><span>Ejercicio</span>
    </a>
  </nav>

  <script type="module" src="assets/js/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: Crear `assets/js/app.js` (stub)**

```js
document.getElementById('app').innerHTML = '<p class="card">Scaffold OK</p>';
```

- [ ] **Step 4: Verificar localmente**

Desde la raíz del proyecto levantar servidor: `python -m http.server 8000` (o `npx -y serve .`). Abrir `http://localhost:8000`.
Expected: página en blanco pastel con tarjeta "Scaffold OK" y tab-bar inferior con 4 ítems. Sin errores en consola. La fuente Inter carga.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/css/styles.css assets/js/app.js
git commit -m "feat: scaffold SPA con Tailwind CDN y paleta pastel"
```

---

### Task 2: Datos — config.json y habits.json

**Files:**
- Create: `assets/data/config.json`
- Create: `assets/data/habits.json`

**Interfaces:**
- Produces: `config.json` con campos `fechaInicio`, `objetivosDiarios.{kcalMin,kcalMax,aguaVasos,pasos}`, `perfiles[]`. `habits.json` con `habitos[]` (id, nombre, icono).

- [ ] **Step 1: Crear `assets/data/config.json`**

```json
{
  "fechaInicio": "2026-07-09",
  "objetivosDiarios": {
    "kcalMin": 1050,
    "kcalMax": 1350,
    "aguaVasos": 8,
    "pasos": 8000
  },
  "perfiles": [
    { "id": "oscar", "nombre": "OSCAR" },
    { "id": "sharon", "nombre": "SHARON" }
  ]
}
```

- [ ] **Step 2: Crear `assets/data/habits.json`**

```json
{
  "habitos": [
    { "id": "skincare-am", "nombre": "Skincare AM", "icono": "☀️" },
    { "id": "skincare-pm", "nombre": "Skincare PM", "icono": "🌙" },
    { "id": "hidratacion", "nombre": "Hidratación (8 vasos)", "icono": "💧" },
    { "id": "sueno", "nombre": "Dormir 7-8h", "icono": "🛏️" },
    { "id": "meditacion", "nombre": "Meditación 10 min", "icono": "🧘" },
    { "id": "ducha", "nombre": "Ducha", "icono": "🚿" }
  ]
}
```

- [ ] **Step 3: Verificar**

Abrir `http://localhost:8000/assets/data/config.json` y `.../habits.json` en el navegador. Expected: JSON válido renderizado. Sin error 404.

- [ ] **Step 4: Commit**

```bash
git add assets/data/config.json assets/data/habits.json
git commit -m "feat: agrega config y habits json"
```

---

### Task 3: Datos — menus.json (perfiles OSCAR y SHARON, 7 días)

**Files:**
- Create: `assets/data/menus.json`

**Interfaces:**
- Produces: `menus.json` con `menus.{oscar|sharon}.{lunes..domingo}.{desayuno|mediasNueves|almuerzo|onces|comida}.{plato,ingredientes[],kcalTotal}`. `ingredientes[]`: objetos `{i, cantidad, kcal}`.

**Notas:** Las comidas compartidas (desayuno, mediasNueves, onces) son idénticas en ambos perfiles. Solo difieren almuerzo y comida (la proteína). Las calorías por ingrediente se estiman para que el total por comida coincida con `dieta-menu.md` sección 3. El día 1 del reto (2026-07-09) es jueves; el mapeo `(dia-1)%7` → 0=lunes...6=domingo se basa en posición, no en fecha real. La vista usa `fechaInicio + (N-1)` para obtener el día de la semana real. Para consistencia se mantiene el orden lunes→domingo del JSON; el mapeo real se hace por fecha.

- [ ] **Step 1: Mapear menús desde `dieta-menu.md`**

Leer `dieta-menu.md` (lunes-domingo). Por día:
- desayuno, mediasNueves (Nueves), almuerzo (con proteína por perfil), onces, comida (con proteína por perfil) — ambas comidas principales tienen proteínas separadas.

- [ ] **Step 2: Crear `assets/data/menus.json` con los 7 días de ambos perfiles**

Estructura (ejemplo-completo solo para LUNES; replicar mismo patrón para martes-domingo con los platos del `dieta-menu.md`, ajustando proteínas por perfil):

```json
{
  "menus": {
    "oscar": {
      "lunes": {
        "desayuno": {
          "plato": "Café con leche + huevo tibio + arepa con queso",
          "ingredientes": [
            { "i": "Café con leche descremada", "cantidad": "1 pocillo", "kcal": 80 },
            { "i": "Huevo tibio", "cantidad": "1 unidad", "kcal": 70 },
            { "i": "Arepa de maíz", "cantidad": "1 mediana", "kcal": 80 },
            { "i": "Queso campesino", "cantidad": "1 tajada", "kcal": 110 }
          ],
          "kcalTotal": 340
        },
        "mediasNueves": {
          "plato": "Papaya + maní natural",
          "ingredientes": [
            { "i": "Papaya picada", "cantidad": "1 taza", "kcal": 55 },
            { "i": "Maní natural", "cantidad": "1 puñado (15g)", "kcal": 90 }
          ],
          "kcalTotal": 145
        },
        "almuerzo": {
          "plato": "Arroz integral + Ensalada + Filete de pescado a la plancha",
          "ingredientes": [
            { "i": "Arroz integral", "cantidad": "1 pocillo mediano", "kcal": 150 },
            { "i": "Ensalada (lechuga, tomate, pepino)", "cantidad": "1 porción", "kcal": 40 },
            { "i": "Filete de pescado blanco a la plancha", "cantidad": "1 filete", "kcal": 130 },
            { "i": "Agua con limón", "cantidad": "1 vaso", "kcal": 5 }
          ],
          "kcalTotal": 325
        },
        "onces": {
          "plato": "Yogur griego + fresas",
          "ingredientes": [
            { "i": "Yogur griego natural", "cantidad": "1 vaso (100g)", "kcal": 60 },
            { "i": "Fresas picadas", "cantidad": "1 porción", "kcal": 50 }
          ],
          "kcalTotal": 110
        },
        "comida": {
          "plato": "Ensalada fresca + Filete de pescado a la plancha + Agua aromática",
          "ingredientes": [
            { "i": "Ensalada fresca", "cantidad": "1/2 taza", "kcal": 20 },
            { "i": "Filete de pescado blanco a la plancha", "cantidad": "1 filete", "kcal": 130 },
            { "i": "Agua aromática", "cantidad": "1 vaso", "kcal": 5 }
          ],
          "kcalTotal": 155
        }
      },
      "martes": { "...": "ver dieta-menu.md, proteína Tú: pollo" },
      "miercoles": { "...": "carne de res" },
      "jueves": { "...": "pollo" },
      "viernes": { "...": "carne de res" },
      "sabado": { "...": "pescado" },
      "domingo": { "...": "pollo/pescado" }
    },
    "sharon": {
      "lunes": {
        "desayuno": { "plato": "Café con leche + huevo tibio + arepa con queso", "ingredientes": [ { "i": "Café con leche descremada", "cantidad": "1 pocillo", "kcal": 80 }, { "i": "Huevo tibio", "cantidad": "1 unidad", "kcal": 70 }, { "i": "Arepa de maíz", "cantidad": "1 mediana", "kcal": 80 }, { "i": "Queso campesino", "cantidad": "1 tajada", "kcal": 110 } ], "kcalTotal": 340 },
        "mediasNueves": { "plato": "Papaya + maní natural", "ingredientes": [ { "i": "Papaya picada", "cantidad": "1 taza", "kcal": 55 }, { "i": "Maní natural", "cantidad": "1 puñado (15g)", "kcal": 90 } ], "kcalTotal": 145 },
        "almuerzo": {
          "plato": "Arroz integral + Ensalada + Quinoa con verduras",
          "ingredientes": [
            { "i": "Arroz integral", "cantidad": "1 pocillo mediano", "kcal": 150 },
            { "i": "Ensalada (lechuga, tomate, pepino)", "cantidad": "1 porción", "kcal": 40 },
            { "i": "Quinoa cocida con verduras", "cantidad": "1/2 taza", "kcal": 110 },
            { "i": "Agua con limón", "cantidad": "1 vaso", "kcal": 5 }
          ],
          "kcalTotal": 305
        },
        "onces": { "plato": "Yogur griego + fresas", "ingredientes": [ { "i": "Yogur griego natural", "cantidad": "1 vaso (100g)", "kcal": 60 }, { "i": "Fresas picadas", "cantidad": "1 porción", "kcal": 50 } ], "kcalTotal": 110 },
        "comida": {
          "plato": "Ensalada fresca + Quinoa con verduras + Agua aromática",
          "ingredientes": [
            { "i": "Ensalada fresca", "cantidad": "1/2 taza", "kcal": 20 },
            { "i": "Quinoa con verduras", "cantidad": "1/2 taza", "kcal": 110 },
            { "i": "Agua aromática", "cantidad": "1 vaso", "kcal": 5 }
          ],
          "kcalTotal": 135
        }
      },
      "martes": { "...": "proteína Sharon: carve" },
      "miercoles": { "...": "embutidos vegetales" },
      "jueves": { "...": "quinoa con champiñones" },
      "viernes": { "...": "carve" },
      "sabado": { "...": "embutidos vegetales" },
      "domingo": { "...": "hamburguesa carve" }
    }
  }
}
```

> **IMPORTANTE:** Al completar este archivo, NO dejar las entradas `"...": "..."`. Reemplazar cada día con la estructura completa (las 5 comidas con sus `plato`, `ingredientes[]` y `kcalTotal`), tomando los platos y cantidades literalmente de `dieta-menu.md` (sección 1, días lunes-domingo) y las calorías de la sección 3. Las comidas compartidas (desayuno, mediasNueves, onces) tienen el mismo contenido en `oscar` y `sharon` — pueden copiarse. Solo `almuerzo` y `comida` difieren en la proteína.

- [ ] **Step 3: Validar JSON**

En navegador abrir `http://localhost:8000/assets/data/menus.json`. Usar pestaña Network o un validador inline (copiar a https://jsonlint.com si hace falta). Expected: JSON válido, sin error. Verificar que existen las claves `menus.oscar.lunes.almuerzo` y `menus.sharon.lunes.almuerzo` con `plato`, `ingredientes` y `kcalTotal`.

- [ ] **Step 4: Commit**

```bash
git add assets/data/menus.json
git commit -m "feat: agrega menus semanales para oscar y sharon"
```

---

### Task 4: Datos — routines.json (90 rutinas)

**Files:**
- Create: `assets/data/routines.json`

**Interfaces:**
- Produces: `routines.json` con `rutinas[]` (90 elementos, uno por día del reto). Cada elemento: `{dia, nombre, ejercicios[]}` donde `ejercicios[]`: `{id, e, series, reps}`. `id` único dentro de cada rutina, formato `ex-1`, `ex-2`, etc.

- [ ] **Step 1: Definir plantillas temáticas (6 plantillas)**

Calendario de 90 días con rotación semanal de 6 plantillas (días 1-6 activos, día 7 descanso activo):

| Día mod 7 | Nombre | Ejercicios |
|-----------|--------|------------|
| 0 | Full Body | Sentadillas 3×15, Flexiones 3×12, Plancha 3×30s |
| 1 | Cardio | Jumping jacks 3×40, Burpees 3×10, Mountain climbers 3×20 |
| 2 | Core | Crunches 3×20, Plancha lateral 3×20s, Elevación piernas 3×15 |
| 3 | Pierna | Sentadillas 3×15, Zancadas 3×12, Puentes 3×15 |
| 4 | Empuje/Tirón | Flexiones 3×12, Remo con botella 3×15, Press hombro 3×12 |
| 5 | Descanso Activo | Caminata 20min, Estiramiento 10min |
| 6 | Cardio | Jumping jacks 3×40, Burpees 3×10, Mountain climbers 3×20 |

- [ ] **Step 2: Crear `assets/data/routines.json` con las 90 rutinas**

Generar las 90 entradas siguiendo la rotación. Cada entrada:

```json
{ "dia": 1, "nombre": "Full Body", "ejercicios": [
  { "id": "ex-1", "e": "Sentadillas", "series": 3, "reps": "15" },
  { "id": "ex-2", "e": "Flexiones", "series": 3, "reps": "12" },
  { "id": "ex-3", "e": "Plancha", "series": 3, "reps": "30s" }
]}
```

Las 90 entradas deben generarse siguiendo el patrón `(dia-1) % 7` → plantilla de la tabla. Los IDs de ejercicio reinician para cada rutina (`ex-1`, `ex-2`, ...). Para generar el archivo se puede usar un script Node de una sola línea:

```bash
node -e "const fs=require('fs');const t=[['Full Body',[['Sentadillas',3,'15'],['Flexiones',3,'12'],['Plancha',3,'30s']]],['Cardio',[['Jumping jacks',3,'40'],['Burpees',3,'10'],['Mountain climbers',3,'20']]],['Core',[['Crunches',3,'20'],['Plancha lateral',3,'20s'],['Elevación de piernas',3,'15']]],['Pierna',[['Sentadillas',3,'15'],['Zancadas',3,'12'],['Puentes de glúteo',3,'15']]],['Empuje/Tirón',[['Flexiones',3,'12'],['Remo con botella',3,'15'],['Press de hombro',3,'12']]],['Descanso Activo',[['Caminata',1,'20min'],['Estiramiento',1,'10min']]],['Cardio',[['Jumping jacks',3,'40'],['Burpees',3,'10'],['Mountain climbers',3,'20']]]];const rutinas=[];for(let d=1;d<=90;d++){const idx=(d-1)%7;const[name,exs]=t[idx];rutinas.push({dia:d,nombre:name,ejercicios:exs.map((e,i)=>({id:'ex-'+(i+1),e:e[0],series:e[1],reps:e[2]}))})};fs.writeFileSync('assets/data/routines.json',JSON.stringify({rutinas},null,2));"
```

- [ ] **Step 3: Verificar**

Abrir `http://localhost:8000/assets/data/routines.json`. Expected: JSON válido con `rutinas.length === 90`. El día 90 debe tener `nombre` según `(90-1)%7 = 5` → "Descanso Activo". El día 7 → `(7-1)%7 = 6` → "Cardio".

- [ ] **Step 4: Commit**

```bash
git add assets/data/routines.json
git commit -m "feat: agrega 90 rutinas de ejercicio"
```

---

### Task 5: store.js — Estado y persistencia LocalStorage

**Files:**
- Create: `assets/js/store.js`

**Interfaces:**
- Consumes: none (autocontenido, opera sobre LocalStorage).
- Produces: módulo `store.js` que exporta `state` (con `data` opcional, `perfil` actual) y funciones: `init(perfiles)`, `getPerfilActivo()`, `setPerfil(id)`, `toggleComida(fecha, comida)`, `toggleHabito(fecha, id)`, `sumarAgua(fecha, delta)`, `setPasos(fecha, n)`, `toggleEjercicio(fecha, exId)`, `completarRutina(fecha, val)`, `getComidas(fecha)`, `getHabitos(fecha)`, `getEjercicios(fecha)`, `isRutinaCompletada(fecha)`, `getAgua(fecha)`, `getPasos(fecha)`, `getPerfilFecha(fecha)`.

- [ ] **Step 1: Crear `assets/js/store.js`**

```js
const KEY = 'reto90_nutricion';
const VERSION = 1;

const state = { data: null, perfil: null, storage: null };

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
```

> Nota: `toggleEjercicio` y `completarRutina` dependen de `state.data.routines` y `challengeDiaFromFecha`. Por ahora se dejan así; el `app.js` inyectará `state.data` antes de cualquier mutación. Si durante esta tarea se prueba en aislamiento, mocks para `state.data`.

- [ ] **Step 2: Prueba de Consola**

Reemplazar temporalmente `app.js` con:

```js
import * as store from './store.js';
const meta = document.createElement('script');
// Cargar datos manualmente para la prueba
fetch('assets/data/config.json').then(r=>r.json()).then(async cfg => {
  store.state.data = { config: cfg, routines: { rutinas: [{ dia:1, ejercicios: [{id:'ex-1'}] }] }, menus: {oscar:{},sharon:{}} };
  store.init(cfg.perfiles);
  store.setPerfil('oscar');
  store.toggleComida(store.getPerfilActivo() && '2026-07-09', 'desayuno');
  console.log('COMIDAS:', store.getComidas('2026-07-09')); // ['desayuno']
  console.log('AGUA:', store.getAgua('2026-07-09')); // 0
  store.sumarAgua('2026-07-09', 2);
  console.log('AGUA+2:', store.getAgua('2026-07-09')); // 2
  console.log('STORAGE:', JSON.parse(localStorage.getItem('reto90_nutricion')));
});
```

- [ ] **Step 3: Verificar**

Recargar `http://localhost:8000`. Consola debe mostrar: `COMIDAS: ['desayuno']`, `AGUA: 0`, `AGUA+2: 2`, `STORAGE:` con `perfilActivo: 'oscar'`. Recargar página: el Storage persiste (verificar en Application > Local Storage). Evitar dejar la importación del meta script no usada — limpiar antes del commit.

- [ ] **Step 4: Revertir app.js a stub y commit**

Restaurar `assets/js/app.js` a:
```js
document.getElementById('app').innerHTML = '<p class="card">Scaffold OK</p>';
```

```bash
git add assets/js/store.js assets/js/app.js
git commit -m "feat: store.js con persistencia LocalStorage y API de mutacion"
```

---

### Task 6: challenge.js — Lógica del reto

**Files:**
- Create: `assets/js/challenge.js`

**Interfaces:**
- Consumes: `store.state.data.config.fechaInicio` (string `YYYY-MM-DD`).
- Produces: `challenge.js` que exporta `getEstadoReto()` → `{dia, totalRestante, estado, fase}`, donde `estado` ∈ `'futuro'|'enCurso'|'completado'` y `fase` es un texto legible ("Día N de 90 · quedan M días", "Comienza en X días", "Reto completado").

- [ ] **Step 1: Crear `assets/js/challenge.js`**

```js
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
```

- [ ] **Step 2: Prueba en consola**

 temporal `app.js`:

```js
import * as store from './store.js';
import * as challenge from './challenge.js';
fetch('assets/data/config.json').then(r=>r.json()).then(cfg => {
  store.state.data = { config: cfg };
  console.log(challenge.getEstadoReto());
});
```

- [ ] **Step 3: Verificar**

Con `fechaInicio: "2026-07-09"` y fecha actual 2026-07-09 (según entorno): `getEstadoReto()` debe dar `{dia: 1, estado: 'enCurso', fase: 'Día 1 de 90 · quedan 89 días', ...}`. Si hace falta testear el "futuro", cambiar temporalmente `config.fechaInicio` a una fecha futura y recargar.

- [ ] **Step 4: Revertir app.js y commit**

Restaurar `assets/js/app.js` a stub.
```bash
git add assets/js/challenge.js
git commit -m "feat: challenge.js con cuenta regresiva de 90 dias"
```

---

### Task 7: meals.js — Comida actual y mapeo día→menú

**Files:**
- Create: `assets/js/meals.js`

**Interfaces:**
- Consumes: `store.state.data.config.fechaInicio` y `store.state.data.menus[perfil]`.
- Produces: `meals.js` que exporta `getComidaActual()` → `string` (una de `desayuno|mediasNueves|almuerzo|onces|comida`), `getDiaSemanaForReto(dia)` → `string` (`lunes..domingo`), `getMenu(fecha)` → obj de menú del día del perfil activo, `COMIDAS` (array ordenado).

- [ ] **Step 1: Crear `assets/js/meals.js`**

```js
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
  return state.data.menus[perfil][diaSem];
}

export function getMenuReto(diaReto) {
  const perfil = state.perfil;
  const diaSem = getDiaSemanaForReto(diaReto);
  return state.data.menus[perfil][diaSem];
}
```

- [ ] **Step 2: Prueba en consola**

`app.js` temporal:
```js
import * as store from './store.js';
import * as meals from './meals.js';
Promise.all([fetch('assets/data/config.json').then(r=>r.json()), fetch('assets/data/menus.json').then(r=>r.json())])
  .then(([cfg, menus]) => {
    store.state.data = { config: cfg, menus };
    store.state.perfil = 'oscar';
    console.log('actual:', meals.getComidaActual());
    console.log('diaSemana reto 1:', meals.getDiaSemanaForReto(1));
    console.log('menu hoy oscar:', meals.getMenuReto(1).almuerzo.plato);
  });
```

- [ ] **Step 3: Verificar**

Para `fechaInicio: "2026-07-09"` (jueves → `getDiaSemanaForReto(1)` debe ser `jueves`). El menú del día para oscar día 1 debe tener `.almuerzo.plato` con texto que incluye "Arroz integral" (siTask 3 dejó el ejemplo lunes como día 1 — debe coincidir con el día jueves real del JSON si se completó correctamente).

- [ ] **Step 4: Revertir app.js y commit**

```bash
git add assets/js/meals.js
git commit -m "feat: meals.js con getComidaActual y mapeo dia del reto a menu"
```

---

### Task 8: router.js — Hash routing

**Files:**
- Create: `assets/js/router.js`

**Interfaces:**
- Consumes: vistas importadas via import dinámico; `store.getPerfilActivo()`.
- Produces: `router.js` que exporta `initRouter()` (instala listener `hashchange` + primer render) y `navigate(hash)` (cambia `location.hash`).

- [ ] **Step 1: Crear `assets/js/router.js`**

```js
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
```

- [ ] **Step 2: Prueba con vista placeholder**

Crear `assets/js/views/selector.js` mínimo temporal:
```js
export default function render(mount, deps) {
  mount.innerHTML = '<p class="card">Selector placeholder</p>';
}
```

`app.js` temporal:
```js
import * as store from './store.js';
import { initRouter, setDeps } from './router.js';
fetch('assets/data/config.json').then(r=>r.json()).then(cfg => {
  store.state.data = { config: cfg };
  store.init(cfg.perfiles);
  setDeps({ store });
  initRouter();
});
```

- [ ] **Step 3: Verificar sin perfil**

Recargar sin LocalStorage (limpiar en DevTools Application > Local Storage > remove reto90_nutricion). URL debe autocompletar `#selector`. Se renderiza "Selector placeholder".

- [ ] **Step 4: Verificar con perfil**

En consola: `store.setPerfil('oscar')`. Cambiar URL a `#dashboard` manually o ejecutar `location.hash = '#dashboard'`. Como dashboard.js no existe aún, debe mostrar error controlado ("Error al cargar la vista") en la tarjeta, no exception fatal. Aceptar temporalmente.

- [ ] **Step 5: Commit**

```bash
git add assets/js/router.js assets/js/views/selector.js assets/js/app.js
git commit -m "feat: router con hash routing y proteccion de perfil"
```

---

### Task 9: Vista selector.js

**Files:**
- Modify: `assets/js/views/selector.js`

**Interfaces:**
- Consumes: `deps.store` (`setPerfil`), `deps.router` (`navigate`), `deps.data.config.perfiles`.
- Produces: render que muestra 2 botones (OSCAR, SHARON). Al click, `store.setPerfil(id)` y `router.navigate('#dashboard')`.

- [ ] **Step 1: Reemplazar `assets/js/views/selector.js`**

```js
export default function render(mount, deps) {
  const { store, router } = deps;
  const perfiles = store.state.data.config.perfiles;
  mount.innerHTML = `
    <div class="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div class="text-center mb-4">
        <h1 class="text-2xl text-[#3A4A5C] mb-1">Reto 90 Días</h1>
        <p class="text-sm text-[#7A8A9A]">Elige tu perfil para comenzar</p>
      </div>
      ${perfiles.map(p => `
        <button data-id="${p.id}" class="card w-full max-w-xs py-6 text-center text-xl font-semibold text-[#3A4A5C] hover:bg-[#F5F7FA] transition">
          ${p.nombre}
        </button>
      `).join('')}
    </div>`;
  mount.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.setPerfil(btn.dataset.id);
      router.navigate('#dashboard');
    });
  });
}
```

- [ ] **Step 2: Verificar**

Limpiar LocalStorage, recargar. Ver dos botones OSCAR / SHARON. Click OSCAR: URL pasa a `#dashboard` (renderiza placeholder de error hasta que dashboard.js exista). Recargar: sigue en dashboard. Para volver a probar el selector, ejecutar en consola `localStorage.clear(); location.hash = '#selector'`.

- [ ] **Step 3: Commit**

```bash
git add assets/js/views/selector.js
git commit -m "feat: vista selector de perfil"
```

---

### Task 10: Vista dashboard.js

**Files:**
- Create: `assets/js/views/dashboard.js`

**Interfaces:**
- Consumes: `deps.store` (getPerfilActivo, getComidas, getHabitos, getAgua, getPasos, sumarAgua, setPasos, isRutinaCompletada, state.data.habits.habitos, state.data.routines.rutinas), `deps.challenge` (getEstadoReto), `deps.meals` (getComidaActual, getMenuReto, COMIDAS_LABEL), `deps.router` (navigate).
- Produces: render con header (perfil + fase reto + link historial), tarjetas de métricas, resumen de 3 secciones con botones a las vistas.

- [ ] **Step 1: Crear `assets/js/views/dashboard.js`**

```js
import { COMIDAS, COMIDAS_LABEL, getComidaActual, getMenuReto } from '../meals.js';
import { getEstadoReto } from '../challenge.js';
import { state, getComidas, getHabitos, getAgua, getPasos, sumarAgua, setPasos, isRutinaCompletada, getPerfilActivo } from '../store.js';

function hoyLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d - off * 60000).toISOString().slice(0, 10);
}

function kcalConsumidas(fecha) {
  const menu = getMenuReto(getEstadoReto().dia);
  if (!menu) return 0;
  const marcadas = getComidas(fecha);
  return marcadas.reduce((acc, c) => acc + (menu[c]?.kcalTotal || 0), 0);
}

export default function render(mount, deps) {
  const fecha = hoyLocal();
  const reto = getEstadoReto();
  const perfilActivo = getPerfilActivo();
  const perfilNombre = state.data.config.perfiles.find(p => p.id === perfilActivo)?.nombre || perfilActivo;
  const habitos = state.data.habits.habitos;
  const habCompleted = getHabitos(fecha).length;
  const habTotal = habitos.length;
  const agua = getAgua(fecha);
  const aguaObj = state.data.config.objetivosDiarios.aguaVasos;
  const pasos = getPasos(fecha);
  const pasosObj = state.data.config.objetivosDiarios.pasos;
  const rutinaOk = isRutinaCompletada(fecha);
  const kcal = kcalConsumidas(fecha);
  const kcalMin = state.data.config.objetivosDiarios.kcalMin;
  const kcalMax = state.data.config.objetivosDiarios.kcalMax;
  const kcalPct = Math.min(100, Math.round(kcal / kcalMax * 100));

  let comidaActual = getComidaActual();
  const marcadas = getComidas(fecha);
  if (marcadas.includes(comidaActual)) {
    comidaActual = COMIDAS.find(c => !marcadas.includes(c)) || comidaActual;
  }
  const menuHoy = getMenuReto(reto.dia) || {};
  const platoActual = menuHoy[comidaActual]?.plato || '—';
  const kcalActual = menuHoy[comidaActual]?.kcalTotal || 0;
  const rutinaHoy = state.data.routines.rutinas[reto.dia - 1];
  const ejTotal = rutinaHoy ? rutinaHoy.ejercicios.length : 0;

  mount.innerHTML = `
    <header class="flex items-center justify-between mb-3">
      <div>
        <a href="#selector" class="text-sm text-[#7A8A9A] hover:underline">${perfilNombre} ⮕</a>
        <h2 class="text-lg text-[#3A4A5C]">${reto.fase}</h2>
      </div>
      <a href="#historial" class="text-2xl" aria-label="Historial">📊</a>
    </header>

    <div class="card">
      <div class="flex justify-between text-sm mb-1"><span>Calorías</span><span>${kcal} / ${kcalMin}-${kcalMax} kcal</span></div>
      <div class="progress-bar"><span style="width:${kcalPct}%"></span></div>
    </div>

    <div class="card flex items-center justify-between">
      <div><div class="text-sm text-[#7A8A9A]">Hábitos</div><div class="text-xl">${habCompleted}/${habTotal}</div></div>
      <a href="#cuidado" class="text-sm text-[#A7C7E7]">Ver todos</a>
    </div>

    <div class="card flex items-center justify-between gap-2">
      <div><div class="text-sm text-[#7A8A9A]">Agua</div><div class="text-xl">${agua}/${aguaObj} vasos</div></div>
      <div class="flex gap-2">
        <button id="agua-menos" class="w-8 h-8 rounded-full bg-[#E0E8F0] text-lg">-</button>
        <button id="agua-mas" class="w-8 h-8 rounded-full bg-[#A7C7E7] text-lg">+</button>
      </div>
    </div>

    <div class="card flex items-center justify-between">
      <div><div class="text-sm text-[#7A8A9A]">Pasos</div>
        <input id="pasos-input" type="number" inputmode="numeric" value="${pasos}" class="w-24 border-b border-[#E0E8F0] bg-transparent text-xl text-[#3A4A5C] outline-none">
        <span class="text-xs text-[#7A8A9A]">/ ${pasosObj}</span>
      </div>
    </div>

    <div class="card flex items-center justify-between">
      <div><div class="text-sm text-[#7A8A9A]">Rutina</div><div class="text-xl">${rutinaOk ? 'Completada ✅' : 'Pendiente'}</div></div>
      <a href="#ejercicio" class="text-sm text-[#A7C7E7]">Ver rutina</a>
    </div>

    <h3 class="text-sm text-[#7A8A9A] mt-4 mb-2">ALIMENTACIÓN · ${COMIDAS_LABEL[comidaActual]}</h3>
    <div class="card">
      <div class="font-medium text-[#3A4A5C]">${platoActual}</div>
      <div class="text-xs text-[#7A8A9A] mb-2">${kcalActual} kcal</div>
      <a href="#alimentacion" class="text-sm text-[#A7C7E7]">Ver detalle</a>
    </div>

    <h3 class="text-sm text-[#7A8A9A] mt-4 mb-2">EJERCICIO · Día ${reto.dia}</h3>
    <div class="card">
      <div class="font-medium text-[#3A4A5C]">${rutinaHoy ? rutinaHoy.nombre : '—'}</div>
      <div class="text-xs text-[#7A8A9A] mb-2">${ejTotal} ejercicios</div>
      <a href="#ejercicio" class="text-sm text-[#A7C7E7]">Ver rutina</a>
    </div>
  `;

  mount.querySelector('#agua-menos').addEventListener('click', () => { sumarAgua(fecha, -1); render(mount, deps); });
  mount.querySelector('#agua-mas').addEventListener('click', () => { sumarAgua(fecha, 1); render(mount, deps); });
  const pasosInput = mount.querySelector('#pasos-input');
  pasosInput.addEventListener('change', () => { setPasos(fecha, parseInt(pasosInput.value || '0', 10)); });
};
```

- [ ] **Step 2: Actualizar `app.js` con todas las dependencias**

```js
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
```

> `store.state.data` se setea antes de `init` y antes de cualquier render. `store.state.perfil` se rehidrata desde storage.

- [ ] **Step 3: Verificar**

Limpiar LocalStorage, recargar. Selector aparece. Elegir OSCAR. Landing en dashboard:
- Header con "OSCAR ⮕" y fase del reto correcta para 2026-07-09.
- Tarjeta Calorías con barra; al principio 0.
- Tarjetas de Hábitos (0/6), Agua (0/8 con botones+/-), Pasos (input 0/8000), Rutina (Pendiente).
- Bloque ALIMENTACIÓN con etiqueta de comida actual + plato.
- Bloque EJERCICIO con nombre de rutina y nº ejercicios.
- Botones de agua + / - actualizan el número y persisten (recargar mantener).
- Cambiar input de pasos, recargar, mantener valor.
- Clic en "Ver detalle" lleva a `#alimentacion` (placeholder de error hasta ejercicio.js exista). El tab-bar inferior trabaja.

- [ ] **Step 4: Commit**

```bash
git add assets/js/views/dashboard.js assets/js/app.js
git commit -m "feat: dashboard con metricas y resumen de secciones"
```

---

### Task 11: Vista alimentacion.js

**Files:**
- Create: `assets/js/views/alimentacion.js`

**Interfaces:**
- Consumes: `deps.store` (getComidas, toggleComida), `deps.meals` (getMenuReto, COMIDAS, COMIDAS_LABEL, getComidaActual), `deps.challenge` (getEstadoReto), `deps.data.config.objetivosDiarios`.
- Produces: render con tabs horizontales (5 comidas), tarjeta del plato seleccionado, lista de ingredientes, toggle marcar, barra inferior sticky con calorías del día.

- [ ] **Step 1: Crear `assets/js/views/alimentacion.js`**

```js
import { COMIDAS, COMIDAS_LABEL, getComidaActual, getMenuReto } from '../meals.js';
import { getEstadoReto } from '../challenge.js';
import { getComidas, toggleComida } from '../store.js';

function hoyLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d - off * 60000).toISOString().slice(0, 10);
}

let comidaSel = null;

export default function render(mount, deps) {
  const fecha = hoyLocal();
  const retoDia = getEstadoReto().dia;
  const menu = getMenuReto(retoDia) || {};
  const marcadas = getComidas(fecha);
  if (!comidaSel || !COMIDAS.includes(comidaSel)) comidaSel = getComidaActual();
  const plato = menu[comidaSel] || { plato: '—', ingredientes: [], kcalTotal: 0 };
  const marcada = marcadas.includes(comidaSel);
  const kcalTotalDia = marcadas.reduce((acc, c) => acc + (menu[c]?.kcalTotal || 0), 0);
  const kcalMax = deps.store.state.data.config.objetivosDiarios.kcalMax;
  const kcalMin = deps.store.state.data.config.objetivosDiarios.kcalMin;

  mount.innerHTML = `
    <header class="mb-3">
      <h2 class="text-lg text-[#3A4A5C]">Alimentación · Día ${retoDia}</h2>
    </header>
    <div class="tab-scroll mb-3">
      ${COMIDAS.map(c => `
        <button data-comida="${c}" class="px-3 py-1.5 rounded-xl text-sm whitespace-nowrap ${comidaSel === c ? 'bg-[#A7C7E7] text-white' : 'bg-white text-[#7A8A9A] border border-[#E0E8F0]'}">
          ${COMIDAS_LABEL[c]}${marcadas.includes(c) ? ' ✓' : ''}
        </button>
      `).join('')}
    </div>

    <div class="card">
      <div class="flex justify-between items-start">
        <h3 class="font-semibold text-[#3A4A5C]">${plato.plato}</h3>
        <span class="rounded-full px-3 py-1 text-sm bg-[#D4C5F9] text-[#3A4A5C]">${plato.kcalTotal} kcal</span>
      </div>
      <ul class="mt-3 divide-y divide-[#E0E8F0]">
        ${(plato.ingredientes || []).map(ing => `
          <li class="py-2 flex justify-between text-sm">
            <span class="text-[#3A4A5C]">${ing.i}</span>
            <span class="text-[#7A8A9A]">${ing.cantidad} · ${ing.kcal} kcal</span>
          </li>
        `).join('')}
      </ul>
      <button id="toggle-comida" class="mt-3 w-full py-2 rounded-xl font-medium ${marcada ? 'bg-[#B5E8C9] text-[#3A4A5C]' : 'bg-[#A7C7E7] text-white'}">
        ${marcada ? 'Comida consumida ✓' : 'Marcar como consumida'}
      </button>
    </div>

    <div class="fixed bottom-16 inset-x-0 max-w-md mx-auto px-4 py-2 bg-white/95 border-t border-[#E0E8F0] flex justify-between text-sm text-[#3A4A5C]">
      <span>Calorías del día</span>
      <span><b>${kcalTotalDia}</b> / ${kcalMin}-${kcalMax} kcal</span>
    </div>
  `;

  mount.querySelectorAll('button[data-comida]').forEach(btn => {
    btn.addEventListener('click', () => { comidaSel = btn.dataset.comida; render(mount, deps); });
  });
  mount.querySelector('#toggle-comida').addEventListener('click', () => {
    toggleComida(fecha, comidaSel);
    render(mount, deps);
  });
}
```

- [ ] **Step 2: Verificar**

Desde el dashboard (perfil OSCAR), clic "Ver detalle" o en tab Alimentación. Ver:
- 5 tabs scrollables. La comida actual queda resaltada.
- Tarjeta con plato, ingredientes (tabla vertical) y total kcal.
- Botón "Marcar como consumida" cambia a verde "Comida consumida ✓".
- Barra inferior muestra summatoria de calorías marcadas; al marcar varias crece.
- Persistencia: recargar mantiene marcas (verificar en LocalStorage).
- Cambiar de tab no pierde el estado de marcado de las demás.

- [ ] **Step 3: Commit**

```bash
git add assets/js/views/alimentacion.js
git commit -m "feat: vista alimentacion con tabs de comida y marcado"
```

---

### Task 12: Vista cuidado.js

**Files:**
- Create: `assets/js/views/cuidado.js`

**Interfaces:**
- Consumes: `deps.store` (getHabitos, toggleHabito, getAgua, sumarAgua, state.data.habits.habitos, state.data.config.objetivosDiarios).
- Produces: render con lista de hábitos, widget de agua, barra inferior resumen.

- [ ] **Step 1: Crear `assets/js/views/cuidado.js`**

```js
import { getHabitos, toggleHabito, getAgua, sumarAgua, state } from '../store.js';

function hoyLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d - off * 60000).toISOString().slice(0, 10);
}

function habitosCompletados(fecha) {
  const todos = state.data.habits.habitos;
  const marcados = getHabitos(fecha);
  const agua = getAgua(fecha);
  const aguaObj = state.data.config.objetivosDiarios.aguaVasos;
  return todos.filter(h => h.id === 'hidratacion' ? agua >= aguaObj : marcados.includes(h.id)).length;
}

export default function render(mount, deps) {
  const fecha = hoyLocal();
  const habitos = state.data.habits.habitos;
  const marcados = getHabitos(fecha);
  const agua = getAgua(fecha);
  const aguaObj = state.data.config.objetivosDiarios.aguaVasos;
  const completados = habitosCompletados(fecha);
  const pct = Math.round(completados / habitos.length * 100);

  mount.innerHTML = `
    <header class="mb-3">
      <h2 class="text-lg text-[#3A4A5C]">Cuidado Personal</h2>
    </header>
    <ul class="space-y-2">
      ${habitos.map(h => {
        if (h.id === 'hidratacion') {
          const ok = agua >= aguaObj;
          const vasos = Array.from({length: aguaObj}).map((_,i) => `<button data-vaso="${i}" class="text-2xl ${i < agua ? '' : 'opacity-30'}">💧</button>`).join('');
          return `
            <li class="card" data-h="${h.id}">
              <div class="flex justify-between items-center">
                <span class="text-[#3A4A5C]">${h.icono} ${h.nombre}</span>
                <span class="text-sm ${ok ? 'text-[#B5E8C9]' : 'text-[#7A8A9A]'}">${ok ? '✓' : agua + '/' + aguaObj}</span>
              </div>
              <div class="flex flex-wrap gap-1 mt-2" id="vasos">${vasos}</div>
              <div class="flex gap-2 mt-2">
                <button id="agua-menos" class="px-3 py-1 rounded-lg bg-[#E0E8F0]">-</button>
                <button id="agua-mas" class="px-3 py-1 rounded-lg bg-[#A7C7E7] text-white">+</button>
              </div>
            </li>`;
        }
        const ok = marcados.includes(h.id);
        return `
          <li class="card flex justify-between items-center" data-h="${h.id}">
            <span class="text-[#3A4A5C]">${h.icono} ${h.nombre}</span>
            <button data-toggle="${h.id}" class="w-7 h-7 rounded-full ${ok ? 'bg-[#B5E8C9]' : 'bg-[#E0E8F0]'} text-sm">${ok ? '✓' : ''}</button>
          </li>`;
      }).join('')}
    </ul>
    ${completados === habitos.length ? '<div class="card text-center text-[#B5E8C9] font-medium">Día completo 🎉</div>' : ''}
    <div class="fixed bottom-16 inset-x-0 max-w-md mx-auto px-4 py-2 bg-white/95 border-t border-[#E0E8F0] text-center text-sm text-[#3A4A5C]">
      ${completados} de ${habitos.length} hábitos completados · ${pct}%
    </div>
  `;

  mount.querySelectorAll('button[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => { toggleHabito(fecha, btn.dataset.toggle); render(mount, deps); });
  });
  mount.querySelector('#agua-menos').addEventListener('click', () => { sumarAgua(fecha, -1); render(mount, deps); });
  mount.querySelector('#agua-mas').addEventListener('click', () => { sumarAgua(fecha, 1); render(mount, deps); });
  mount.querySelectorAll('button[data-vaso]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.vaso, 10);
      sumarAgua(fecha, (idx + 1) - agua);
      render(mount, deps);
    });
  });
}
```

- [ ] **Step 2: Verificar**

Desde el dashboard, clic en Cuidado. Ver:
- 6 hábitos listados. La hidratación con widget de vasos clickeables (clic en el vaso 4 → marca 4 vasos).
- Toggle de cada hábito. Check verde al completar.
- Barra inferior con porcentaje.
- Al completar los 6 hábitos: aparece "Día completo 🎉".
- El contador de hábitos del dashboard debe refrescarse al volver (revisar consistencia: el dashboard relee store al render, OK).
- Persistencia: recargar mantiene estado.

- [ ] **Step 3: Commit**

```bash
git add assets/js/views/cuidado.js
git commit -m "feat: vista cuidado personal con habitos y widget de agua"
```

---

### Task 13: Vista ejercicio.js

**Files:**
- Create: `assets/js/views/ejercicio.js`

**Interfaces:**
- Consumes: `deps.store` (getEjercicios, toggleEjercicio, completarRutina, isRutinaCompletada, state.data.routines.rutinas), `deps.challenge` (getEstadoReto).
- Produces: render con rutina del día, lista de ejercicios con checkbox, barra de progreso, botón completar rutina.

- [ ] **Step 1: Crear `assets/js/views/ejercicio.js`**

```js
import { getEstadoReto } from '../challenge.js';
import { getEjercicios, toggleEjercicio, completarRutina, isRutinaCompletada, state } from '../store.js';

function hoyLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d - off * 60000).toISOString().slice(0, 10);
}

export default function render(mount, deps) {
  const fecha = hoyLocal();
  const retoDia = getEstadoReto().dia;
  const rutina = state.data.routines.rutinas[retoDia - 1];
  if (!rutina) {
    mount.innerHTML = '<p class="card">No hay rutina para hoy.</p>';
    return;
  }
  const completados = getEjercicios(fecha);
  const rutinaOk = isRutinaCompletada(fecha);
  const hechos = completados.length;
  const total = rutina.ejercicios.length;
  const pct = Math.round(hechos / total * 100);

  mount.innerHTML = `
    <header class="mb-3">
      <h2 class="text-lg text-[#3A4A5C]">Rutina Día ${retoDia}</h2>
      <div class="text-sm text-[#7A8A9A]">${rutina.nombre}</div>
    </header>
    <div class="card">
      <div class="flex justify-between text-sm mb-1"><span>Ejercicios</span><span>${hechos}/${total}</span></div>
      <div class="progress-bar"><span style="width:${pct}%"></span></div>
    </div>
    <ul class="space-y-2 mt-3">
      ${rutina.ejercicios.map(e => {
        const ok = completados.includes(e.id);
        return `
          <li class="card flex justify-between items-center">
            <div>
              <div class="text-[#3A4A5C]">${e.e}</div>
              <div class="text-xs text-[#7A8A9A]">${e.series} × ${e.reps}</div>
            </div>
            <button data-ex="${e.id}" class="w-7 h-7 rounded-full ${ok ? 'bg-[#B5E8C9]' : 'bg-[#E0E8F0]'} text-sm">${ok ? '✓' : ''}</button>
          </li>`;
      }).join('')}
    </ul>
    <button id="completar" class="mt-4 w-full py-3 rounded-xl font-medium ${rutinaOk ? 'bg-[#B5E8C9] text-[#3A4A5C]' : 'bg-[#A7C7E7] text-white'}">
      ${rutinaOk ? 'Rutina completada ✓' : 'Completar rutina'}
    </button>
    <div class="fixed bottom-16 inset-x-0 max-w-md mx-auto px-4 py-2 bg-white/95 border-t border-[#E0E8F0] text-center text-sm text-[#3A4A5C]">
      ${hechos} de ${total} · ${pct}%
    </div>
  `;

  mount.querySelectorAll('button[data-ex]').forEach(btn => {
    btn.addEventListener('click', () => { toggleEjercicio(fecha, btn.dataset.ex); render(mount, deps); });
  });
  mount.querySelector('#completar').addEventListener('click', () => {
    completarRutina(fecha, !isRutinaCompletada(fecha));
    render(mount, deps);
  });
}
```

- [ ] **Step 2: Verificar**

Desde el dashboard, clic Ejercicio. Ver:
- Header "Rutina Día N" con nombre de plantilla.
- Barra de progreso 0/total.
- Cada ejercicio con botón circular de check al hacer click.
- Al marcar todos automáticamente, estado de rutina completa.
- Botón "Completar rutina" marca todos de una vez.
- Si la rutina ya está completa, el botón muestra "Rutina completada ✓" y al hacer click desmarca (vuelve a pendiente).
- El dashboard debe mostrar "Rutina Completada ✅" al volver.

- [ ] **Step 3: Commit**

```bash
git add assets/js/views/ejercicio.js
git commit -m "feat: vista ejercicio con rutina del dia y completar"
```

---

### Task 14: Vista historial.js

**Files:**
- Create: `assets/js/views/historial.js`

**Interfaces:**
- Consumes: `deps.store` (getPerfilFecha, state.data.habits.habitos, state.data.routines.rutinas, state.data.config), `deps.meals` (getMenuReto), `deps.challenge` (getEstadoReto, diaDelRetoParaFecha).
- Produces: render con selector de últimos 7 días, 4 tarjetas de resumen, detalle expansible, gráfico SVG de barras, contadores globales del reto.

- [ ] **Step 1: Crear `assets/js/views/historial.js`**

```js
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
```

- [ ] **Step 2: Verificar**

Desde el dashboard, clic en el ícono 📊. Ver:
- Chips horizontales con fechas de los últimos 7 días en formato MM-DD.
- 4 tarjetas de resumen (calorías, comidas, hábitos, rutina) para el día seleccionado.
- Detalle del día expandible.
- Gráfico SVG de barras (7 barras) con color según si kcal cae en rango.
- Contador de rutinas completadas / 90.
- Porcentaje de adherencia.
- Cambiar día clic recarga resumen.
- Si el día seleccionado cae fuera del reto (antes de fechaInicio), muestra "Día fuera del reto".

- [ ] **Step 3: Commit**

```bash
git add assets/js/views/historial.js
git commit -m "feat: vista historial con grafico svg y progreso del reto"
```

---

### Task 15: Integración final + manejo de errores de carga

**Files:**
- Modify: `assets/js/app.js`

**Interfaces:**
- Consumes: todos los módulos.
- Produces: `app.js` robusto: si algún `fetch` falla, muestra mensaje en `#app` y bloquea el ingreso (no inicializa router).

- [ ] **Step 1: Reemplazar `app.js`**

```js
import * as store from './store.js';
import * as challenge from './challenge.js';
import * as meals from './meals.js';
import { initRouter, setDeps, navigate } from './router.js';

async function main() {
  const app = document.getElementById('app');
  let datos;
  try {
    const [config, menus, routines, habits] = await Promise.all([
      fetch('assets/data/config.json').then(r => { if (!r.ok) throw new Error('config.json'); return r.json(); }),
      fetch('assets/data/menus.json').then(r => { if (!r.ok) throw new Error('menus.json'); return r.json(); }),
      fetch('assets/data/routines.json').then(r => { if (!r.ok) throw new Error('routines.json'); return r.json(); }),
      fetch('assets/data/habits.json').then(r => { if (!r.ok) throw new Error('habits.json'); return r.json(); })
    ]);
    datos = { config, menus, routines, habits };
  } catch (e) {
    app.innerHTML = `<div class="card text-center text-[#3A4A5C] mt-10">
      <p class="text-lg mb-2">Error cargando datos</p>
      <p class="text-sm text-[#7A8A9A]">Verifica que el archivo <code>${e.message}</code> exista y sirva el sitio vía HTTP (no file://).</p>
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
```

- [ ] **Step 2: Verificar flujo completo end-to-end**

Con LocalStorage limpio, recargar:
1. URL autocompleta `#selector`. Aparecen botones OSCAR/SHARON.
2. Clic OSCAR → `#dashboard`. Header "OSCAR ⮕" + fase "Día 1 de 90 · quedan 89 días".
3. Marcar Agua +5 en dashboard → número 5/8 y persiste al recargar.
4. Ir a `#alimentacion` → marcar almuerzo → barra inferior kcal actualizada. Volver a dashboard → calorías refrescadas.
5. Ir a `#cuidado` → completar 5 hábitos (incluida hidratación) → barra inferior 5 de 6. Marcar skincare-am → "Día completo 🎉".
6. Ir a `#ejercicio` → clic "Completar rutina" → todos los ejercicios con check. Volver a dashboard → "Rutina Completada ✅".
7. Ir a `#historial` → día actual. Las 4 tarjetas con datos del día. Gráfico SVG visible. Contador rutinas = 1/90. Adherencia = 100%.
8. Cambiar a perfil SHARON (borrar localStorage y elegir SHARON): el menú mostrado en alimentación debe tener proteína vegetariana (ej. quinoa en el almuerzo, distinto a pescado de OSCAR) según el día.
9. Tab-bar inferior funciona: alternar Inicio/Alimentación/Cuidado/Ejercicio sin recargas.

- [ ] **Step 3: Verificar detección de error**

Renombrar temporalmente `assets/data/menus.json` (p ej. moverlo). Recargar. Debe mostrar tarjeta "Error cargando datos — menus.json". Restaurar el archivo. Recargar: la app funciona.

- [ ] **Step 4: Commit**

```bash
git add assets/js/app.js
git commit -m "feat: app.js robusto con manejo de errores de carga"
```

---

### Task 16: Avisos en UI sobre persistencia local + edge cases

**Files:**
- Modify: `assets/js/views/dashboard.js`
- Modify: `assets/js/views/selector.js`

**Interfaces:**
- Consumes: reto estado (futuro/completado), `challenge.getEstadoReto()`.
- Produces: bloqueo/aviso en dashboard cuando el reto no está en curso; nota discreta sobre LocalStorage.

- [ ] **Step 1: Añadir nota LocalStorage en selector.js**

Añadir debajo de los botones en `selector.js` (en el string de `mount.innerHTML`), antes del cierre del contenedor:

```html
<p class="text-xs text-[#7A8A9A] text-center max-w-xs">Tu progreso se guarda localmente en este dispositivo.</p>
```

- [ ] **Step 2: Añadir bloqueos en dashboard.js**

En `dashboard.js`, al inicio del render (tras calcular `reto`), insertar un banner condicional. Antes del `mount.innerHTML = ...`, agregar:

```js
let banner = '';
if (reto.estado === 'futuro') {
  banner = `<div class="card text-center text-sm text-[#7A8A9A] mb-3">El reto aún no comienza. ${reto.fase}. El registro de progreso estará disponible desde el inicio.</div>`;
} else if (reto.estado === 'completado') {
  banner = `<div class="card text-center text-sm text-[#B5E8C9] mb-3">🎉 ${reto.fase}. ¡Felicidades!</div>`;
}
```

Y montar `banner` al inicio del `mount.innerHTML` (justo antes del `<header>`).

- [ ] **Step 3: Verificar**

Con `fechaInicio` actual (2026-07-09) hoy: debe mostrar NO banners (estado enCurso). Cambiar temporalmente `config.json` fechaInicio a una fecha futura (+1 mes). Recargar: dashboard con banner "El reto aún no comienza". Restaurar fechaInicio.

- [ ] **Step 4: Commit**

```bash
git add assets/js/views/selector.js assets/js/views/dashboard.js
git commit -m "feat: avisos de reto futuro/completado y nota de persistencia local"
```

---

### Task 17: Documentación de despliegue

**Files:**
- Create: `README.md`

**Interfaces:**
- Produces: `README.md` con pasos locales y de despliegue.

- [ ] **Step 1: Crear `README.md`**

````markdown
# Reto 90 Días — Nutrición y Bienestar

SPA Vanilla (HTML/JS + Tailwind CDN) para gestionar alimentación, cuidado personal y ejercicio de dos perfiles (OSCAR y SHARON) durante un reto de 90 días. El progreso se guarda en LocalStorage del navegador.

## Requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari).
- Para desarrollo local: un servidor HTTP estático (los datos se cargan vía `fetch`, no funciona con `file://`).

## Desarrollo local

Opción 1 — Python:
```bash
python -m http.server 8000
```

Opción 2 — Node (serve):
```bash
npx -y serve .
```

Abrir `http://localhost:8000`.

## Estructura

- `index.html` — punto de entrada SPA.
- `assets/css/styles.css` — variables de paleta y utilidades.
- `assets/js/` — módulos ES (app, router, store, challenge, meals, views/).
- `assets/data/` — JSON estáticos: `config.json`, `menus.json`, `routines.json`, `habits.json`.

## Perfiles

- OSCAR — menú con proteína animal.
- SHARON — menú vegetariano.
La app no expone etiquetas de dieta; cada perfil ve su menú automáticamente.

## Datos

- `config.json` define `fechaInicio` (inicio global del reto) y `objetivosDiarios` (rango de calorías 1050-1350, 8 vasos de agua, 8000 pasos).
- `menus.json` define menú semanal para los dos perfiles (lunes-domingo, 5 comidas por día).
- `routines.json` define 90 rutinas de ejercicio (rotación de plantillas temáticas).
- `habits.json` define la lista fija de 6 hábitos diarios.

El progreso del usuario (comidas marcadas, hábitos completados, ejercicios, agua, pasos) se persiste en LocalStorage bajo la clave `reto90_nutricion`.

## Despliegue gratuito

### Netlify Drop
1. Abre <https://app.netlify.com/drop>.
2. Arrastra la carpeta del proyecto.
3. Recibe una URL pública al instante.

### Vercel
1. Crea cuenta en <https://vercel.com>.
2. Importa el repositorio.
3. Framework preset: "Other". Build command vacío. Output directory: raíz del proyecto.
4. Despliega.

### GitHub Pages
1. Push a GitHub.
2. Settings → Pages → Source: rama `main`, carpeta `/`.
3. URL pública disponible en minutos.

El sitio no requiere build paso porque Tailwind se carga por CDN y no hay dependencias.

## Limitaciones

- El progreso no se sincroniza entre dispositivos (LocalStorage es por navegador).
- Para editar menús/rutinas/hábitos hay que modificar los archivos JSON en `assets/data/`.
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: readme con guia de despliegue"
```

---

## Resumen de tareas

| # | Tarea | Deliverable testable |
|---|-------|---------------------|
| 1 | Scaffold | index.html + tab-bar + paleta cargados |
| 2 | config + habits | dos JSON válidos |
| 3 | menus.json | 14 menús (2 perfiles × 7 días) |
| 4 | routines.json | 90 rutinas |
| 5 | store.js | persistencia LocalStorage funcional |
| 6 | challenge.js | cuenta regresiva correcta |
| 7 | meals.js | comida actual + mapeo menú |
| 8 | router.js | hash routing con guard de perfil |
| 9 | selector.js | selector de perfil |
| 10 | dashboard.js | métricas + resumen de 3 secciones |
| 11 | alimentacion.js | tabs + ingredientes + marcar |
| 12 | cuidado.js | hábitos + widget agua |
| 13 | ejercicio.js | rutina + ejercicios + completar |
| 14 | historial.js | gráfico SVG + progreso reto |
| 15 | app.js final | manejo de errores de carga |
| 16 | Avisos UI | banners reto futuro/completado |
| 17 | README | guía de despliegue |