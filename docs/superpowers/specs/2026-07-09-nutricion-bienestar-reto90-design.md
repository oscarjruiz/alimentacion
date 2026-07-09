# Sistema de Gestión de Nutrición y Bienestar Personal (Reto 90 Días) — Diseño

**Fecha:** 2026-07-09
**Topico:** nutricion-bienestar-reto90
**Stack:** Vanilla HTML/JS + Tailwind (CDN) + LocalStorage. Sin build, sin npm, sin backend.

## 1. Objetivo y alcance

Aplicación web SPA (single-page application) para gestionar la alimentación, el cuidado personal y el ejercicio de dos perfiles de usuario independientes, en el marco de un reto motivacional de 90 días con cuenta regresiva fija.

El propósito es entregar una experiencia tipo app móvil (responsiva, ligera, fluida) con despliegue estático gratuito (Netlify/Vercel arrastrando la carpeta).

### Enfoque arquitectónico

SPA con hash routing. Un solo `index.html` como punto de entrada. JavaScript modular (ES modules) gestiona vistas. Tailwind via CDN. Datos estáticos cargados via `fetch` desde archivos JSON. Estado (progreso del usuario) persistente en LocalStorage.

No hay backend, ni autenticación real, ni sincronización entre dispositivos. Cada perfil guarda su avance localmente en el navegador.

### Secciones funcionales

Tres secciones principales bajo la misma dinámica del reto de 90 días:

1. **Alimentación** — menús detallados por comida con ingredientes, cantidades y calorías.
2. **Cuidado Personal** — hábitos diarios predefinidos con toggle completado.
3. **Ejercicio** — rutina del día con ejercicios, series y repeticiones.

El dashboard muestra una vista condensada de las tres secciones con acceso a cada vista detallada.

## 2. Estructura de archivos

```
pagina-alimentacion/
├── index.html                      # SPA punto de entrada
├── opencode.json                   # Configuración OpenCode (plugin + MCP)
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-07-09-nutricion-bienestar-reto90-design.md
├── assets/
│   ├── css/
│   │   └── styles.css              # Estilos custom (complemento a Tailwind)
│   ├── js/
│   │   ├── app.js                  # Orquestador: init, carga datos, render inicial
│   │   ├── router.js               # Hash routing (#dashboard, #alimentacion, etc.)
│   │   ├── store.js                # Estado global + persistencia LocalStorage
│   │   ├── challenge.js            # Lógica del reto (cuenta regresiva, día actual)
│   │   ├── meals.js                # getComidaActual(), mapeo día del reto → menú
│   │   └── views/
│   │       ├── selector.js         # Selección de perfil (entrada)
│   │       ├── dashboard.js        # Vista resumen principal
│   │       ├── alimentacion.js     # Vista detallada de menús
│   │       ├── cuidado.js         # Vista de hábitos diarios
│   │       ├── ejercicio.js       # Vista de rutina diaria
│   │       └── historial.js       # Histórico por día + progreso del reto
│   └── data/
│       ├── config.json             # fechaInicio, objetivosDiarios
│       ├── menus.json              # Menú semanal (7 días x 5 comidas)
│       ├── routines.json           # 90 rutinas de ejercicio (una por día)
│       └── habits.json             # Hábitos diarios predefinidos (constantes)
```

## 3. Router y vistas

`router.js` escucha `hashchange` y mapea el hash a una función de render. Antes de cualquier vista, valida que haya un perfil seleccionado en `store`. Si no existe, redirige a `#selector`.

| Hash | Vista | Descripción |
|------|-------|-------------|
| `#selector` | selector | Elegir perfil 1 o 2 (entrada inicial) |
| `#dashboard` | dashboard | Resumen condensado de las 3 secciones + métricas del día |
| `#alimentacion` | alimentacion | Vista detallada de menús (comida actual, detalle, marcar) |
| `#cuidado` | cuidado | Lista de hábitos diarios con toggle completado |
| `#ejercicio` | ejercicio | Rutina del día con ejercicios, series y reps |
| `#historial` | historial | Avance por día (calorías, hábitos, rutinas completadas) |

**Navegación fija:** Barra inferior (tab-bar) fija con 4 ítems: Inicio, Alimentación, Cuidado, Ejercicio. El dashboard se accede vía "Inicio"; el historial vía ícono en el header del dashboard.

## 4. Modelo de datos

Los datos de referencia (menús, rutinas, hábitos, configuración) son estáticos y de solo lectura. El estado editable del usuario vive en LocalStorage.

### assets/data/config.json

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

La fecha de inicio es global para ambos perfiles. La cuenta regresiva arranca desde `fechaInicio` (definida aquí) y descuenta un día cada 24 horas.

El objetivo calórico es un rango 1050-1350 kcal/día (no un valor fijo). La barra de progreso se llena contra `kcalMax`; el "ok" visual se da cuando el consumo está entre `kcalMin` y `kcalMax`.

Los dos perfiles no exponen tipo de dieta en la app. Internamente, OSCAR usa menú con proteína animal y SHARON menú vegetariano, pero esto es transparente en la UI.

### assets/data/menus.json

Dos menús semanales paralelos (uno por perfil), 7 días (lunes a domingo), 5 comidas por día. Cada comida tiene: nombre del plato, lista de ingredientes (con cantidad y calorías), y total de calorías.

Las 5 comidas por día son:
- `desayuno`
- `mediasNueves`
- `almuerzo`
- `onces`
- `comida`

```json
{
  "menus": {
    "oscar": {
      "lunes": {
        "desayuno": {
          "plato": "Café con leche + huevo + arepa con queso",
          "ingredientes": [
            { "i": "Café con leche descremada", "cantidad": "1 pocillo", "kcal": 100 },
            { "i": "Huevo tibio", "cantidad": "1 unidad", "kcal": 70 },
            { "i": "Arepa de maíz", "cantidad": "1 mediana", "kcal": 80 },
            { "i": "Queso campesino", "cantidad": "1 tajada", "kcal": 110 }
          ],
          "kcalTotal": 360
        },
        "mediasNueves": {
          "plato": "Papaya + maní",
          "ingredientes": [
            { "i": "Papaya picada", "cantidad": "1 taza", "kcal": 55 },
            { "i": "Maní natural", "cantidad": "1 puñado (15g)", "kcal": 90 }
          ],
          "kcalTotal": 145
        },
        "almuerzo": {
          "plato": "Arroz integral + Ensalada + Filete de pescado",
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
          "plato": "Ensalada + Filete de pescado a la plancha",
          "ingredientes": [
            { "i": "Ensalada fresca", "cantidad": "1/2 taza", "kcal": 20 },
            { "i": "Filete de pescado a la plancha", "cantidad": "1 filete", "kcal": 130 },
            { "i": "Agua aromática", "cantidad": "1 vaso", "kcal": 5 }
          ],
          "kcalTotal": 155
        }
      },
      "martes": { ... },
      "miercoles": { ... },
      "jueves": { ... },
      "viernes": { ... },
      "sabado": { ... },
      "domingo": { ... }
    },
    "sharon": {
      "lunes": {
        "desayuno": { "plato": "Café con leche + huevo + arepa con queso", "ingredientes": [...], "kcalTotal": 360 },
        "mediasNueves": { "plato": "Papaya + maní", "ingredientes": [...], "kcalTotal": 145 },
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
        "onces": { "plato": "Yogur griego + fresas", "ingredientes": [...], "kcalTotal": 110 },
        "comida": {
          "plato": "Ensalada + Quinoa con verduras",
          "ingredientes": [
            { "i": "Ensalada fresca", "cantidad": "1/2 taza", "kcal": 20 },
            { "i": "Quinoa con verduras", "cantidad": "1/2 taza", "kcal": 110 },
            { "i": "Agua aromática", "cantidad": "1 vaso", "kcal": 5 }
          ],
          "kcalTotal": 135
        }
      },
      "martes": { ... },
      "miercoles": { ... },
      "jueves": { ... },
      "viernes": { ... },
      "sabado": { ... },
      "domingo": { ... }
    }
  }
}
```

Para los 7 días de cada perfil se usa el plan de `dieta-menu.md`. La diferencia entre ambos perfiles está solo en la proteína principal del almuerzo y la comida:
- OSCAR: pescado/pollo/carne de res según el día.
- SHARON: quinoa/carve/embutidos vegetarianos según el día.
Las demás comidas (desayuno, medias nueves, onces) son compartidas y por tanto idénticas en ambos menús.

> El cálculo de calorías exacto por ingrediente será cargado usando las tablas de referencia del plan (sección 3 de `dieta-menu.md`). El menú JSON completo se construye a partir de ese documento.

**Mapeo día del reto a menú:** El día N del reto se traduce a una fecha `fechaInicio + (N-1) días`, de esa se obtiene el día de la semana (lunes-domingo). Ese key del objeto `menus[perfil]` define el menú de ese día. Como los menús son semanales, el ciclo se repite cada 7 días durante los 90.

### assets/data/routines.json

90 rutinas (una por día del reto) con variación temática (Full Body, Cardio, Core, Pierna, Empuje/Tirón, Descanso activo). Cada rutina trae una lista de ejercicios con series y repeticiones.

```json
{
  "rutinas": [
    {
      "dia": 1,
      "nombre": "Full Body",
      "ejercicios": [
        { "id": "ex-1", "e": "Sentadillas", "series": 3, "reps": "15" },
        { "id": "ex-2", "e": "Flexiones", "series": 3, "reps": "12" },
        { "id": "ex-3", "e": "Plancha", "series": 3, "reps": "30s" }
      ]
    },
    { "dia": 2, "nombre": "Cardio", "ejercicios": [...] }
  ]
}
```

Los IDs `ex-*` son únicos dentro de cada rutina y permiten rastrear progreso individual por ejercicio.

### assets/data/habits.json

Lista fija de hábitos diarios. La misma lista se aplica todos los días del reto.

```json
{
  "habitos": [
    { "id": "skincare-am", "nombre": "Skincare AM", "icono": "sol" },
    { "id": "skincare-pm", "nombre": "Skincare PM", "icono": "luna" },
    { "id": "hidratacion", "nombre": "Hidratación (8 vasos)", "icono": "gota" },
    { "id": "sueno", "nombre": "Dormir 7-8h", "icono": "cama" },
    { "id": "meditacion", "nombre": "Meditación 10 min", "icono": "cerebro" },
    { "id": "ducha", "nombre": "Ducha", "icono": "ducha" }
  ]
}
```

La hidratación (8 vasos) se rastrea con un valor 0-8 en `objetivos[fecha].agua` (no es un hábito booleano).

### Conteo de hábitos para porcentajes

El total de hábitos considerados en "X de Y completados" incluye todos los de la lista. Un hábito se cuenta como completado cuando:

- Es `hidratacion`: se cumple cuando `objetivos[fecha].agua` >= `config.objetivosDiarios.aguaVasos`.
- Los demás: se cumple cuando su ID está en `habitos[fecha]`.

Esto aplica al dashboard (Sección 5), la vista Cuidado Personal (Sección 7) y el historial (Sección 9).

### Estado LocalStorage

Clave única: `reto90_nutricion`. Estructura:

```json
{
  "version": 1,
  "perfilActivo": "oscar",
  "perfiles": {
    "oscar": {
      "nombre": "OSCAR",
      "comidas": { "2026-07-09": ["desayuno", "mediasNueves", "almuerzo", "onces", "comida"] },
      "habitos": { "2026-07-09": ["skincare-am", "meditacion"] },
      "ejercicios": { "2026-07-09": ["ex-1", "ex-3"] },
      "rutinaCompletada": { "2026-07-09": false },
      "objetivos": { "2026-07-09": { "agua": 4, "pasos": 3200 } }
    },
    "sharon": { ... }
  }
}
```

- `comidas[fecha]` — array de keys de comida marcadas ("desayuno", "mediasNueves", "almuerzo", "onces", "comida").
- `habitos[fecha]` — array de IDs de hábitos completados (excluye "hidratacion", que va en `objetivos`).
- `ejercicios[fecha]` — array de IDs de ejercicios completados.
- `rutinaCompletada[fecha]` — booleano.
- `objetivos[fecha]` — `agua` (entero 0-8) y `pasos` (entero).

### Capacidad

Estimación de tamaño por perfil con datos completos de 90 días: ~38 KB. Dos perfiles: ~76 KB. LocalStorage permite 5-10 MB. Uso disponible, sin necesidad de bases de datos.

### Almacenamiento

`store.js` encapsula toda persistencia. API: `getPerfilActivo()`, `setPerfil(id)`, `toggleComida(fecha, comida)`, `toggleHabito(fecha, id)`, `sumarAgua(fecha, delta)`, `setPasos(fecha, n)`, `toggleEjercicio(fecha, exId)`, `completarRutina(fecha, val)`, `getHistorial(fecha)`.

Cada mutación serializa a LocalStorage. La carga inicial crea estructura vacía si no existe.

## 5. Dashboard

Vista resumen, entrada principal del app.

### Layout (mobile-first, vertical)

1. **Header fijo superior**
   - Nombre del perfil activo con opción de cambiar (link a `#selector`)
   - Contador del reto: "Día 1 de 90 — quedan 89 días"
   - Ícono historial (`#historial`)

2. **Métricas del día (tarjetas)**
   - Calorías consumidas / rango objetivo (1050-1350) con barra de progreso contra `kcalMax`
   - Hábitos completados / total
   - Agua: vasos / objetivo con botones +/-
   - Pasos: input numérico editable
   - Rutina: completada / pendiente

3. **Sección Alimentación (resumen)**
   - Card con comida actual sugerida según horario
   - Nombre del plato + kcal total
   - Botón "Ver detalle" -> `#alimentacion`

4. **Sección Cuidado Personal (resumen)**
   - Mini lista (hasta 3 hábitos visibles) con check
   - "X de Y completados"
   - Botón "Ver todos" -> `#cuidado`

5. **Sección Ejercicio (resumen)**
   - Nombre rutina del día + contador ejercicios
   - Estado: completada / pendiente
   - Botón "Ver rutina" -> `#ejercicio`

### Lógica horario (getComidaActual)

Define la comida sugerida por la hora del sistema del dispositivo:

- 06:00-10:00 -> Desayuno
- 10:00-12:30 -> Medias Nueves
- 12:30-15:00 -> Almuerzo
- 15:00-18:00 -> Onces
- 18:00-22:00 -> Comida
- Fuera de rango -> próxima comida del día siguiente

Render: Si no hay comidas marcadas para hoy, sugiere la comida actual. Si la comida actual ya fue marcada, sugiere la siguiente pendiente.

## 6. Vista Alimentación

### Layout (mobile-first)

1. **Header** — título + día del reto
2. **Selector de comida (tabs horizontales scrollables)** — Desayuno, Medias Nueves, Almuerzo, Onces, Comida. Por defecto la comida actual según `getComidaActual()`.
3. **Tarjeta del plato seleccionado**
   - Nombre del plato
   - kcal total destacado (badge pastel)
   - Lista de ingredientes (tabla vertical en mobile): Ingrediente | Cantidad | Calorias
   - Toggle "Marcar como consumida"
4. **Barra inferior sticky**
   - Sumatoria de kcal de las comidas marcadas
   - Objetivo del día: "480 / 1050-1350 kcal"
   - Mini badges de comidas marcadas

### Interacción

- Al marcar comida, actualiza `store.comidas[fecha]` y repinta calorías del día.
- Cambiar de tab no pierde el estado de marcado de las demás.
- Mapeo día del reto: `(dia - 1) % 7` determina clave (lunes-domingo) en `menus[perfilActivo]` en `menus.json`.

## 7. Vista Cuidado Personal

### Layout

1. **Header** — título + día del reto
2. **Lista de hábitos** — tarjetas expandibles con icono (emoji simple):
   ```
   ☀️ Skincare AM                    [✅]
   🌙 Skincare PM                    [⬜]
   💧 Hidratación (8 vasos)          4/8
   ```
3. **Widget de vasos de agua** — botones +/- o iconos clickeables de vasos. Sincroniza con el contador del dashboard.
4. **Barra inferior** — "X de Y hábitos completados — NN%"

### Interacción

- Toggle por hábito -> `store.habitos[fecha]` array.
- Hidratación usa `store.objetivos[fecha].agua` (entero 0-8).
- Si todos los hábitos marcados, aparece badge "Día completo".

## 8. Vista Ejercicio

### Layout

1. **Header** — título + número de día (ej. "Rutina Día 1")
2. **Tarjeta de rutina**
   - Nombre de la rutina
   - Lista de ejercicios: Ejercicio | Series x Reps
   - Cada fila con checkbox para marcar ejercicio individualmente
3. **Barra de progreso** — "X de Y ejercicios completados"
4. **Botón "Completar rutina"** — marca toda la rutina como hecha. Cambia estado a completada y actualiza dashboard. Si ya está completada, el botón muestra "Rutina completada" y permite desmarcar.
5. **Barra inferior sticky** — progreso de ejercicios + botón completar rutina

### Interacción

- Marcar ejercicio individual -> `store.ejercicios[fecha]` array con IDs.
- Al completar todos los ejercicios automáticamente marca `store.rutinaCompletada[fecha] = true`.
- "Completar rutina" marca todos los ejercicios de una vez.

## 9. Vista Historial

### Layout

1. **Header** — título + selector de día (scroll horizontal de chips con fecha de los últimos 7 días)
2. **Resumen del día seleccionado (4 tarjetas)**
   - Calorías: total consumidas / objetivo
   - Comidas: marcadas / 5
   - Hábitos: completados / 6
   - Ejercicio: completada / pendiente
3. **Detalle del día expansible**
   - Comidas consumidas con su aporte calórico individual
   - Hábitos completados / pendientes
   - Rutina completada sí/no
4. **Progreso general del reto**
   - Gráfico simple (barras SVG nativo) de calorías de los últimos 7 días
   - Contador de días con rutina completada ("37 / 90 rutinas")
   - Porcentaje de adherencia general

El gráfico SVG usa elementos `<rect>` nativos. Sin librerías externas de graficación.

## 10. UI/UX y estilos

### Paleta (gama fría pastel, variables CSS)

- Fondo principal: `#F5F7FA` (gris azulado claro)
- Tarjetas: `#FFFFFF` con sombra suave
- Primario: `#A7C7E7` (azul pastel)
- Secundario: `#B5E8C9` (verde menta)
- Acento: `#D4C5F9` (lavanda)
- Texto principal: `#3A4A5C` (gris azulado)
- Texto secundario: `#7A8A9A`
- Éxito/completado: `#B5E8C9`
- Pendiente: `#E0E8F0` (gris muy claro)

### Tipografía

Inter via Google Fonts. Pesos: 400 (body), 500 (botones), 600 (titulos).

### Componentes Tailwind

- Tarjetas: `rounded-2xl shadow-sm p-4`
- Botones: `rounded-xl py-3 px-4 font-medium` con transición
- Toggle/check: iconos SVG inline o emojis (sol, luna, gota, cama, cerebro, ducha)
- Tab-bar inferior: `fixed bottom-0` con 4 iconos + labels
- Badges kcal: `rounded-full px-3 py-1 text-sm`

### Responsive

- Mobile: 1 columna, tab-bar inferior fija
- Tablet/desktop (breakpoints `sm:`/`md:`): hasta 2 columnas en dashboard, historial mantiene lista
- Maximo ancho legible: `max-w-md mx-auto` centra el app como app móvil

### Microinteracciones

- Marcar comida: animación suave del check + cambio de pastel a verde menta
- Contador de reto: numero grande con texto "Quedan X dias"
- Transicion entre vistas: fade-in simple

## 11. Flujo de datos

1. Al cargar, `app.js` hace `fetch` a `data/config.json`, `data/menus.json`, `data/routines.json`, `data/habits.json` en paralelo.
2. Los datos se guardan en variables del modulo (solo lectura durante la sesion).
3. `store.js` carga el estado de LocalStorage o crea estructura vacia si no existe.
4. `router.js` comprueba `store.perfilActivo`. Si es null, redirige a `#selector`.
5. Al seleccionar un perfil, `store.setPerfil(id)` persiste y navega a `#dashboard`.
6. Cada vista renderiza leyendo datos estaticos + estado del perfil activo.
7. Toda mutacion (marcar comida, toggle habit, sumar agua, completar rutina) pasa por `store.js`, que serializa a LocalStorage y dispara un repintado del area afectada.

## 12. Errores y borde

- Si `fetch` de un JSON falla, el app muestra un mensaje "Error cargando datos. Verifica que los archivos existan." y bloquea el ingreso al dashboard.
- Si un perfil guarda datos y despues el navegador borra LocalStorage, el estado se pierde. No hay respaldo. Se advierte al usuario en algun lugar discreto (ej. footer "Tu progreso se guarda localmente en este dispositivo").
- Fechas se manejan en formato `YYYY-MM-DD` usando el huso horario local del dispositivo. No se maneja internacionalizacion de zonas horarias (asume un solo uso local).
- Si `fechaInicio` es futura, el contador muestra "Comienza en X dias" y el dashboard bloquea el registro de progreso hasta que arranque.
- Si pasan mas de 90 dias desde `fechaInicio`, el contador muestra "Reto completado" y el dashboard bloquea nuevos registros (los historicos siguen visibles).

## 13. Testing

Al ser una app Vanilla sin framework de testing preinstalado, se verifican manualmente los flujos clave:

- Seleccion de perfil persiste al recargar.
- Marcar/desmarcar comida, habit, ejercicio actualiza metricas en dashboard e historial.
- Cuenta regresiva correcta para fechaInicio hoy, fecha pasada y fecha futura.
- Mapeo dia del reto -> menu semanal correcto (dia 1 = lunes, dia 7 = domingo, dia 8 vuelve a lunes).
- LocalStorage serializa y carga correctamente al cerrar y reabrir el navegador.
- Responsive en breakpoint mobile (`max-w-md`), tablet y desktop.

## 14. Despliegue

1. Abrir la carpeta del proyecto en el navegador (`index.html`) para verificar localmente.
2. Arrastrar la carpeta a Netlify Drop (https://app.netlify.com/drop) o conectar el repositorio a Vercel.
3. El sitio se sirve como archivos estaticos. No requiere build.
4. URL gratuita disponible al instante.

## 15. Futuro (fuera del alcance actual)

- Sincronizacion entre dispositivos via Supabase/Firebase (solo cambiando `store.js`).
- Panel admin para editar menús/rutinas.
- Notificaciones push para recordar comidas/habitos.
- Mas de dos perfiles.