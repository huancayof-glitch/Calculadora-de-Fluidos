# Calculadora de Fluidos Pediátricos

Web estática (HTML/CSS/JS puro, sin dependencias) extraída de la app Android original.
Calcula agua endógena y pérdidas insensibles según el peso del paciente.

**Autor de la aplicación:** Dr. Carlos Huaraca Carhuaricra

## Cómo publicarla en GitHub Pages (gratis)

1. Ve a [github.com](https://github.com) e inicia sesión (o crea una cuenta gratis).
2. Crea un repositorio nuevo, por ejemplo `fluidos-pediatricos` (puede ser público).
3. Sube estos archivos al repositorio (botón "Add file" → "Upload files"), o usando git:
   ```bash
   git init
   git add .
   git commit -m "Calculadora de fluidos pediátricos"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/fluidos-pediatricos.git
   git push -u origin main
   ```
4. En el repositorio, ve a **Settings → Pages**.
5. En "Source", elige la rama `main` y la carpeta `/ (root)`. Guarda.
6. Espera 1-2 minutos. Tu web quedará disponible en:
   `https://TU_USUARIO.github.io/fluidos-pediatricos/`

## Cómo usarla desde tu iPhone como si fuera una app

1. Abre esa URL en Safari (importante: en Safari, no en Chrome).
2. Toca el botón de compartir (el cuadrado con la flecha hacia arriba).
3. Selecciona **"Agregar a pantalla de inicio"**.
4. Listo: te aparecerá un ícono en tu pantalla de inicio y se abrirá a pantalla completa, como una app nativa. Funciona sin conexión una vez cargada la primera vez.

## Archivos incluidos

- `index.html` — estructura de la calculadora
- `styles.css` — estilos visuales
- `calculator.js` — lógica de cálculo (fórmulas clínicas)
- `main.js` — interacción con la interfaz
- `autor_carlos.jpg` — foto de fondo del autor
- `manifest.json`, `icon-192.png`, `icon-512.png` — para que sea instalable como PWA

## Nota clínica

Esta es una herramienta de apoyo. No sustituye la valoración médica ni los protocolos institucionales. Verifica siempre los resultados antes de aplicarlos (ver aviso dentro de la propia app para pacientes de más de 30 kg).
