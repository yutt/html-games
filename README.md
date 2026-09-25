# Juegos infantiles

Repositorio de juegos HTML autocontenidos publicado automáticamente con GitHub Pages.

## Organización

- `public/`: juegos terminados que se publican.
- `drafts/`: versiones en desarrollo; nunca se publican.
- `scripts/generate-index.mjs`: genera la portada leyendo los `<title>` de `public/`.
- `.github/workflows/deploy-pages.yml`: construye y publica la web.

No edites ni añadas `public/index.html`: la acción genera la portada durante cada despliegue.

## Añadir o renombrar un juego

1. Coloca o renombra el HTML dentro de `public/`.
2. Comprueba que tenga un `<title>` descriptivo.
3. Haz commit y push a `main`.

El enlace y el título de la portada se actualizarán automáticamente. Opcionalmente puedes añadir:

```html
<meta name="description" content="Descripción breve del juego">
```

## Primera publicación

En GitHub abre **Settings → Pages → Build and deployment** y selecciona **GitHub Actions**. Después ejecuta el flujo **Publicar juegos** o haz un push a `main`.

## Probar la portada localmente

```bash
node scripts/generate-index.mjs public _site
```

Abre `_site/index.html` en el navegador. La carpeta `_site/` es temporal y no debe subirse.
