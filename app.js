'use strict';
if (document.body.dataset.page === 'home') {
  const oldId = new URLSearchParams(location.search).get('id');
  if (oldId !== null) {
    if (/^0*(?:[1-9]|1[0-8])$/.test(oldId)) {
      location.replace(`stories/${String(Number(oldId)).padStart(3, '0')}/`);
    } else {
      const note = document.createElement('p');
      note.className = 'empty';
      note.textContent = '这个编号尚未收录，请从下方目录选择故事。';
      document.querySelector('#archive').prepend(note);
    }
  }
  const toolbar = document.querySelector('.toolbar');
  const search = document.querySelector('#search');
  const cards = [...document.querySelectorAll('.story-card')];
  const buttons = [...document.querySelectorAll('[data-filter]')];
  let theme = '全部';
  function filter() {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const card of cards) {
      card.hidden = !((theme === '全部' || card.dataset.theme === theme) && card.dataset.search.toLocaleLowerCase().includes(query));
      if (!card.hidden) count++;
    }
    document.querySelector('#result-count').textContent = `显示 ${count} / ${cards.length} 则图文`;
    document.querySelector('#empty').hidden = count > 0;
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    theme = button.dataset.filter;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filter();
  }));
  search.addEventListener('input', filter);
  toolbar.hidden = false;
}
if (document.body.dataset.page === 'story') {
  const dialog = document.querySelector('#lightbox');
  const open = document.querySelector('.photo-open');
  if (typeof dialog.showModal === 'function') {
    open.addEventListener('click', event => { event.preventDefault(); dialog.showModal(); });
    document.querySelector('#close-photo').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  }
  const copy = document.querySelector('#copy-link');
  if (navigator.clipboard && window.isSecureContext) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const status = document.querySelector('#copy-status');
      try {
        await navigator.clipboard.writeText(document.querySelector('link[rel="canonical"]').href);
        status.textContent = '链接已复制';
      } catch {
        status.textContent = '未能复制，请从浏览器地址栏复制链接。';
      }
    });
  }
}
