'use strict';

const STORAGE_KEY = 'visitedMountainIDs';

const $ = (id) => document.getElementById(id);
const listEl = $('list');
const emptyEl = $('empty');
const countEl = $('count');
const searchEl = $('search');
const dialogEl = $('detail');

let mountains = [];
let visited = loadVisited();
let filter = 'all';
let query = '';
let current = null; // 詳細シートに表示中の山

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

function isVisited(m) {
  return visited.has(m.id);
}

function setVisited(m, on) {
  if (on) visited.add(m.id);
  else visited.delete(m.id);
  saveVisited();
  render();
  if (current && current.id === m.id) syncDialogToggle();
}

/* ---------- 表示 ---------- */

function prefText(m) {
  return m.prefectures.join('・');
}

function matches(m) {
  if (filter === 'visited' && !isVisited(m)) return false;
  if (filter === 'unvisited' && isVisited(m)) return false;
  if (!query) return true;
  const q = query.toLowerCase();
  return m.name.toLowerCase().includes(q)
    || m.kana.includes(q)
    || m.prefectures.some((p) => p.includes(q))
    || m.range.includes(q);
}

function createRow(m) {
  const li = document.createElement('li');
  li.className = 'row' + (isVisited(m) ? ' done' : '');

  const check = document.createElement('button');
  check.className = 'check';
  check.setAttribute('aria-pressed', String(isVisited(m)));
  check.setAttribute('aria-label', `${m.name} を登頂済みにする`);
  check.innerHTML = '<span class="box"></span>';
  check.addEventListener('click', () => setVisited(m, !isVisited(m)));

  const info = document.createElement('button');
  info.className = 'info-btn';
  info.setAttribute('aria-label', `${m.name} の詳細`);

  const names = document.createElement('div');
  names.className = 'names';

  const name = document.createElement('div');
  name.className = 'name';
  const no = document.createElement('span');
  no.className = 'no';
  no.textContent = m.id;
  name.append(no, document.createTextNode(m.name));

  const sub = document.createElement('div');
  sub.className = 'sub';
  sub.textContent = `${m.kana}｜${prefText(m)}`;

  names.append(name, sub);

  const elev = document.createElement('span');
  elev.className = 'elev';
  elev.innerHTML = `${m.elevation_m.toLocaleString('ja-JP')}<small>m</small>`;

  info.append(names, elev);
  info.addEventListener('click', () => openDetail(m));

  li.append(check, info);
  return li;
}

function render() {
  const shown = mountains.filter(matches);

  const frag = document.createDocumentFragment();
  shown.forEach((m) => frag.appendChild(createRow(m)));
  listEl.replaceChildren(frag);

  emptyEl.hidden = shown.length > 0;
  countEl.textContent = shown.length ? `${shown.length}座を表示中` : '';

  const done = visited.size;
  $('visitedCount').textContent = done;
  $('totalCount').textContent = mountains.length;
  $('barFill').style.width = mountains.length ? `${(done / mountains.length) * 100}%` : '0';
}

/* ---------- 詳細シート ---------- */

function openDetail(m) {
  current = m;
  $('dName').textContent = m.name;

  const rows = [
    ['No.', `${m.id} / ${mountains.length}`],
    ['読み', m.kana],
    ['最高峰', m.highest_peak],
    ['標高', `${m.elevation_m.toLocaleString('ja-JP')} m`],
    ['都道府県', prefText(m)],
    ['山域', m.range],
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

  syncDialogToggle();
  dialogEl.showModal();
}

function syncDialogToggle() {
  const on = isVisited(current);
  const toggle = $('dToggle');
  toggle.setAttribute('aria-pressed', String(on));
  toggle.querySelector('.visit-text').textContent = on ? '登頂済み' : '登頂済みにする';
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

/* ---------- バックアップ ---------- */

$('export').addEventListener('click', () => {
  const payload = {
    app: 'Mountain100',
    version: 1,
    exportedAt: new Date().toISOString(),
    visited: [...visited].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mountain100-record-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

$('importBtn').addEventListener('click', () => $('importFile').click());

$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = (data.visited || []).filter(Number.isInteger);
    if (!Array.isArray(data.visited)) throw new Error('形式が違います');
    if (!confirm(`${ids.length}座の記録を読み込みます。現在の記録は置き換えられます。よろしいですか？`)) return;
    visited = new Set(ids);
    saveVisited();
    render();
    alert('記録を読み込みました。');
  } catch {
    alert('ファイルを読み込めませんでした。書き出したJSONファイルを選んでください。');
  } finally {
    e.target.value = '';
  }
});

/* ---------- 起動 ---------- */

fetch('./mountain100.json')
  .then((r) => r.json())
  .then((data) => {
    mountains = data.mountains.slice().sort((a, b) => a.id - b.id);
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
