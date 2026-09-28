/* Keep entry IDs stable after printing their QR codes. */
'use strict';
const content = document.querySelector('#content');
function empty(message) {
  const p = document.createElement('p');
  p.className = 'empty';
  p.textContent = message;
  content.replaceChildren(p);
}
function mediaUrl(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Missing media URL');
  const url = new URL(value, document.baseURI);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported media URL');
  return url.href;
}
function renderEntry(entry) {
  const card = document.createElement('article');
  card.className = 'card';
  const label = document.createElement('span');
  label.className = 'kind';
  const types = { image: '图片', audio: '音频', video: '视频' };
  label.textContent = types[entry.type] || '内容';
  const h2 = document.createElement('h2');
  h2.textContent = entry.title || '未命名内容';
  card.append(label, h2);
  try {
    if (!types[entry.type]) throw new Error('Unsupported media type');
    const media = document.createElement(entry.type === 'image' ? 'img' : entry.type);
    if (entry.type === 'image') {
      media.alt = entry.alt || entry.title || '图片';
      media.loading = 'lazy';
    } else {
      media.controls = true;
      media.preload = 'metadata';
      if (entry.type === 'video') media.playsInline = true;
    }
    media.addEventListener('error', () => {
      const note = document.createElement('p');
      note.className = 'media-error';
      note.textContent = '这个文件暂时无法打开，请稍后重试。';
      media.replaceWith(note);
    }, { once: true });
    media.src = mediaUrl(entry.src);
    card.append(media);
  } catch {
    const note = document.createElement('p');
    note.textContent = '这条内容正在整理中。';
    card.append(note);
  }
  if (entry.description) {
    const p = document.createElement('p');
    p.textContent = entry.description;
    card.append(p);
  }
  return card;
}
async function load() {
  try {
    const response = await fetch('media.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Unable to load media list');
    const data = await response.json();
    if (!Array.isArray(data.entries)) throw new Error('Invalid media list');
    if (data.title) document.title = data.title;
    const id = new URLSearchParams(location.search).get('id');
    const entries = id === null ? data.entries : data.entries.filter(entry => entry.id === id);
    if (id !== null && entries.length) {
      document.querySelector('#title').textContent = entries[0].title || '我们的影像馆';
      document.title = `${entries[0].title || '媒体内容'} · ${data.title || '我们的影像馆'}`;
      document.querySelector('#description').textContent = '在这里，留住这一刻。';
    }
    if (!entries.length) {
      empty(id === null ? '这里将陆续收录我们的图片、音频和视频。内容正在准备中，欢迎再来看看。' : '这个编号的内容尚未发布。请稍后再来，或点击上方名称回到首页。');
      return;
    }
    content.replaceChildren(...entries.map(renderEntry));
  } catch {
    content.replaceChildren();
    document.querySelector('#error').hidden = false;
  }
}
load();
