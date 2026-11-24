'use strict';
(() => {
  if (!isOnlineManager) return;
  const panel = document.createElement('dialog');
  panel.className = 'publish-panel';
  panel.setAttribute('aria-labelledby', 'publish-title');
  panel.innerHTML = `<form>
    <h2 id="publish-title">Reemplazar imagen</h2><p data-title></p>
    <label>Repositorio de GitHub<input name="repo" placeholder="usuario/repositorio" pattern="[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+" required></label>
    <label>Rama que publica la web<input name="branch" value="main" required></label>
    <label>Token de GitHub<input name="token" type="password" autocomplete="off" required></label>
    <small>Usa un token de acceso detallado limitado a este repositorio, con Contents en lectura y escritura.</small>
    <label>Nueva imagen<input name="art" type="file" accept="image/jpeg,image/png,image/webp" required></label>
    <p role="status" aria-live="polite"></p>
    <button class="btn brand-drive" type="submit">Guardar en GitHub</button>
    <button class="btn outline" type="button">Cerrar</button></form>`;
  document.body.append(panel);
  const form = panel.querySelector('form');
  const fields = form.elements;
  const status = panel.querySelector('[role=status]');
  const close = form.querySelector('[type=button]');
  const save = form.querySelector('[type=submit]');
  const owner = location.hostname.match(/^([\w-]+)\.github\.io$/i)?.[1];
  const project = location.pathname.split('/')[1];
  if (owner) fields.repo.value = owner + '/' + (project && !project.endsWith('.html') ? project : location.hostname);
  let selection;
  function edit(piece) {
    if (!piece || panel.open) return;
    selection = {piece, brand:current().id};
    fields.art.value = '';
    status.textContent = '';
    panel.querySelector('[data-title]').textContent = current().name + ' · ' + piece.title;
    panel.showModal();
  }
  close.onclick = () => panel.close();
  panel.addEventListener('cancel', event => { if (save.disabled) event.preventDefault(); });
  panel.addEventListener('close', () => { fields.token.value = ''; });
  document.addEventListener('click', event => {
    const id = event.target.closest('[data-replace]')?.dataset.replace;
    if (id) edit(current()?.pieces.find(piece => piece.id === id));
  });
  edit(current()?.pieces.find(piece => piece.id === new URLSearchParams(location.search).get('pieza')));

  async function artwork(file, path) {
    const mime = /\.jpe?g$/i.test(path) ? 'image/jpeg' : 'image/png';
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      if (file.type === mime) return file;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (mime === 'image/jpeg') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, mime, .96));
      if (!blob) throw Error('No se pudo convertir la imagen.');
      return blob;
    } finally { URL.revokeObjectURL(url); }
  }
  function base64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  async function publish() {
    const repo = fields.repo.value.trim();
    const token = fields.token.value.trim();
    const branch = fields.branch.value.trim();
    const ref = branch.split('/').map(encodeURIComponent).join('/');
    const {piece, brand} = selection;
    async function api(path, method = 'GET', body) {
      const result = await fetch('https://api.github.com/repos/' + repo + '/' + path, {
        method, redirect:'error', cache:'no-store',
        headers:{Authorization:'Bearer ' + token, Accept:'application/vnd.github+json','Content-Type':'application/json'},
        body:body ? JSON.stringify(body) : undefined
      });
      if (!result.ok) {
        if ([409,422].includes(result.status)) throw Error('La rama cambió o está protegida. Revisa la rama y vuelve a intentar.');
        throw Error('GitHub (' + result.status + '). Revisa el repositorio, la rama y los permisos del token.');
      }
      return result.json();
    }
    const head = await api('git/ref/heads/' + ref);
    const commit = await api('git/commits/' + head.object.sha);
    const dataPath = 'datos/clientes.js';
    const source = await api('contents/' + dataPath + '?ref=' + head.object.sha);
    const js = new TextDecoder().decode(Uint8Array.from(atob(source.content), c => c.charCodeAt(0)));
    const match = js.trim().match(/^window\.BLINK_CLIENTS\s*=\s*([\s\S]+?);?$/);
    if (!match) throw Error('No se reconoce el formato de datos/clientes.js.');
    const brands = JSON.parse(match[1]);
    const record = brands.find(c => c.id === brand)?.pieces.find(p => p.id === piece.id);
    if (!record) throw Error('Esta pieza ya no existe en la rama seleccionada.');
    const path = record.image || record.imageTarget;
    if (!/^img\/(?:[\w -]+\/)+[\w .-]+\.(?:png|jpe?g)$/i.test(path) || path.includes('..')) throw Error('Ruta de imagen no compatible.');
    const blob = await artwork(fields.art.files[0], path);
    const image = await api('git/blobs', 'POST', {encoding:'base64', content:await base64(blob)});
    const tree = [{path, type:'blob', mode:'100644', sha:image.sha}];
    if (!record.image) {
      record.image = path;
      tree.push({path:dataPath, type:'blob', mode:'100644', content:'window.BLINK_CLIENTS = ' + JSON.stringify(brands,null,2) + ';\n'});
    }
    const nextTree = await api('git/trees', 'POST', {base_tree:commit.tree.sha, tree});
    const next = await api('git/commits', 'POST', {message:'Actualizar imagen ' + piece.id, tree:nextTree.sha, parents:[head.object.sha]});
    await api('git/refs/heads/' + ref, 'PATCH', {sha:next.sha, force:false});
    const changes = window.BLINK_REPLACEMENTS ||= new Map();
    const previous = changes.get(piece.id);
    if (previous) URL.revokeObjectURL(previous.url);
    changes.set(piece.id, {url:URL.createObjectURL(blob)});
    if (current()) window.BLINK_EDITOR_API.refresh();
    if (document.querySelector('#pieceDialog').open && current()?.id === brand) openPiece(piece.id);
    fields.art.value = '';
    fields.token.value = '';
    status.textContent = 'Imagen guardada en GitHub. Aparecerá en la web cuando termine la publicación.';
  }
  form.onsubmit = async event => {
    event.preventDefault();
    if (save.disabled) return;
    save.disabled = close.disabled = true;
    status.textContent = 'Guardando en GitHub…';
    try { await publish(); }
    catch (error) { status.textContent = error.message || 'No se pudo guardar la imagen.'; }
    finally { save.disabled = close.disabled = false; }
  };
})();
