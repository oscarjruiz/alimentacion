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