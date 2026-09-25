import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";

const source = process.argv[2] ?? "public";
const output = process.argv[3] ?? "_site";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await findHtmlFiles(path));
    else if (extname(entry.name).toLowerCase() === ".html" && entry.name !== "index.html") files.push(path);
  }
  return files;
}

function extract(html, pattern, fallback) {
  return (html.match(pattern)?.[1] ?? fallback).replace(/\s+/g, " ").trim();
}

function labelFromFilename(filename) {
  return filename
    .replace(/\.html$/i, "")
    .replaceAll(/[-_]+/g, " ")
    .replace(/\b\p{L}/gu, letter => letter.toUpperCase());
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });

const games = [];
for (const file of await findHtmlFiles(source)) {
  const html = await readFile(file, "utf8");
  const route = relative(source, file).split(sep).join("/");
  const fallback = labelFromFilename(route.split("/").at(-1));
  games.push({
    route,
    title: extract(html, /<title[^>]*>([\s\S]*?)<\/title>/i, fallback),
    description: extract(
      html,
      /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i,
      "Juego interactivo para dibujar, escribir y aprender."
    )
  });
}

games.sort((a, b) => a.title.localeCompare(b.title, "es"));
if (!games.length) throw new Error("No hay juegos HTML dentro de public/");

const cards = games.map((game, index) => `
  <a class="game" href="${game.route.split("/").map(encodeURIComponent).join("/")}">
    <span class="number">${index + 1}</span>
    <span><strong>${escapeHtml(game.title)}</strong><small>${escapeHtml(game.description)}</small></span>
    <span class="arrow" aria-hidden="true">→</span>
  </a>`).join("");

const index = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="Colección de juegos infantiles interactivos">
  <title>Juegos infantiles</title>
  <style>
    :root{--ink:#172033;--muted:#68738a;--blue:#3066e8;--bg:#eef4ff}
    *{box-sizing:border-box}body{margin:0;min-height:100vh;padding:clamp(24px,6vw,72px);font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:var(--ink);background:var(--bg)}
    main{width:min(760px,100%);margin:auto}header{text-align:center;margin-bottom:32px}h1{margin:0;font-size:clamp(2.3rem,8vw,4.4rem)}p{color:var(--muted);font-size:1.08rem}
    .games{display:grid;gap:14px}.game{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;padding:20px;text-decoration:none;color:inherit;background:#fff;border:2px solid transparent;border-radius:18px;box-shadow:0 10px 30px #29457918;transition:.16s}
    .game:hover,.game:focus-visible{transform:translateY(-2px);border-color:#8aa9f5;outline:0}.number{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:#e6edff;color:#2857c8;font-weight:900}.game strong{display:block;font-size:1.25rem}.game small{display:block;margin-top:4px;color:var(--muted);line-height:1.35}.arrow{font-size:1.7rem;color:var(--blue)}
  </style>
</head>
<body><main><header><h1>Juegos infantiles</h1><p>Elige un juego para comenzar.</p></header><nav class="games" aria-label="Juegos disponibles">${cards}</nav></main></body>
</html>`;

await writeFile(join(output, "index.html"), index, "utf8");
console.log(`Portada generada con ${games.length} juego(s).`);
