'use strict';

const STORAGE_KEY = 'visitedHeritageIDs';

const $ = (id) => document.getElementById(id);
const listEl = $('list');
const emptyEl = $('empty');
const countEl = $('count');
const searchEl = $('search');
const dialogEl = $('detail');

let sites = [];
let visited = loadVisited();
let filter = 'all';
let category = 'all'; // すべて / 文化遺産 / 自然遺産
let query = '';
let current = null; // 詳細シートに表示中の物件

/* ---------- 永続化 ---------- */

function loadVisited() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw.filter(Number.isInteger) : []);
  } catch {
    return new Set();
  }
}

function saveVisited() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited].sort((a, b) => a - b)));
  } catch {
    alert('記録を保存できませんでした。プライベートブラウズを解除してお試しください。');
  }
}

function isVisited(s) {
  return visited.has(s.id);
}

function setVisited(s, on) {
  if (on) visited.add(s.id);
  else visited.delete(s.id);
  saveVisited();
  render();
  if (current && current.id === s.id) syncDialogToggle();
}

/* ---------- 表示 ---------- */

function prefText(s) {
  return s.prefectures.join('・');
}

function criteriaText(s) {
  return (s.criteria || []).map((c) => `(${c})`).join('');
}

function inCategory(s) {
  return category === 'all' || s.category === category;
}

function matches(s) {
  if (!inCategory(s)) return false;
  if (filter === 'visited' && !isVisited(s)) return false;
  if (filter === 'unvisited' && isVisited(s)) return false;
  if (!query) return true;
  const q = query.toLowerCase();
  return s.name.toLowerCase().includes(q)
    || s.kana.includes(q)
    || s.category.includes(q)
    || String(s.year).includes(q)
    || s.prefectures.some((p) => p.includes(q))
    || (s.note || '').includes(q);
}

function createRow(s) {
  const li = document.createElement('li');
  li.className = 'row' + (isVisited(s) ? ' done' : '');

  const check = document.createElement('button');
  check.className = 'check';
  check.setAttribute('aria-pressed', String(isVisited(s)));
  check.setAttribute('aria-label', `${s.name} を訪問済みにする`);
  check.innerHTML = '<span class="box"></span>';
  check.addEventListener('click', () => setVisited(s, !isVisited(s)));

  const info = document.createElement('button');
  info.className = 'info-btn';
  info.setAttribute('aria-label', `${s.name} の詳細`);

  const names = document.createElement('div');
  names.className = 'names';

  const name = document.createElement('div');
  name.className = 'name';
  const no = document.createElement('span');
  no.className = 'no';
  no.textContent = s.id;
  name.append(no, document.createTextNode(s.name));

  const sub = document.createElement('div');
  sub.className = 'sub';
  const tag = document.createElement('span');
  tag.className = 'tag ' + (s.category === '自然遺産' ? 'nature' : 'culture');
  tag.textContent = s.category.replace('遺産', '');
  sub.append(tag, document.createTextNode(`${s.kana}｜${prefText(s)}`));

  names.append(name, sub);

  const year = document.createElement('span');
  year.className = 'year';
  year.innerHTML = `${s.year}<small>年</small>`;

  info.append(names, year);
  info.addEventListener('click', () => openDetail(s));

  li.append(check, info);
  return li;
}

function render() {
  const shown = sites.filter(matches);

  const frag = document.createDocumentFragment();
  shown.forEach((s) => frag.appendChild(createRow(s)));
  listEl.replaceChildren(frag);

  emptyEl.hidden = shown.length > 0;
  countEl.textContent = shown.length ? `${shown.length}件を表示中` : '';

  // 進捗は選択中の区分（すべて／文化遺産／自然遺産）を母数にする
  const target = sites.filter(inCategory);
  const done = target.filter(isVisited).length;
  $('visitedCount').textContent = done;
  $('totalCount').textContent = target.length;
  $('barFill').style.width = target.length ? `${(done / target.length) * 100}%` : '0';
}

/* ---------- 詳細シート ---------- */

function openDetail(s) {
  current = s;
  $('dName').textContent = s.name;

  const rows = [
    ['No.', `${s.id} / ${sites.length}`],
    ['読み', s.kana],
    ['区分', s.category],
    ['登録年', `${s.year}年`],
    ['都道府県', prefText(s)],
    ['登録基準', criteriaText(s)],
  ].filter(([, value]) => value);

  const dl = $('dInfo');
  dl.replaceChildren(...rows.map(([label, value]) => {
    const div = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    div.append(dt, dd);
    return div;
  }));

  const note = $('dNote');
  note.textContent = s.note || '';
  note.hidden = !s.note;

  syncDialogToggle();
  dialogEl.showModal();
}

function syncDialogToggle() {
  const on = isVisited(current);
  const toggle = $('dToggle');
  toggle.setAttribute('aria-pressed', String(on));
  toggle.querySelector('.visit-text').textContent = on ? '訪問済み' : '訪問済みにする';
}

$('dToggle').addEventListener('click', () => {
  if (current) setVisited(current, !isVisited(current));
});

$('dClose').addEventListener('click', () => dialogEl.close());

// 背景をタップして閉じる
dialogEl.addEventListener('click', (e) => {
  if (e.target === dialogEl) dialogEl.close();
});

dialogEl.addEventListener('close', () => { current = null; });

/* ---------- 検索・絞り込み ---------- */

searchEl.addEventListener('input', () => {
  query = searchEl.value.trim();
  render();
});

document.querySelectorAll('.segmented button').forEach((btn) => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('.segmented button').forEach((b) => {
      const on = b === btn;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', String(on));
    });
    render();
  });
});

document.querySelectorAll('.cats button').forEach((btn) => {
  btn.addEventListener('click', () => {
    category = btn.dataset.category;
    document.querySelectorAll('.cats button').forEach((b) => {
      const on = b === btn;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', String(on));
    });
    render();
  });
});

/* ---------- 起動 ---------- */

fetch('./world-heritage.json')
  .then((r) => r.json())
  .then((data) => {
    sites = data.sites.slice().sort((a, b) => a.id - b.id);
    render();
  })
  .catch(() => {
    emptyEl.hidden = false;
    emptyEl.textContent = 'データを読み込めませんでした。通信状態を確認して再読み込みしてください。';
  });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
