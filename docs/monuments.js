'use strict';

const STORAGE_KEY = 'seenMonumentIDs';
const CATEGORY = document.body.dataset.category;

const $ = (id) => document.getElementById(id);
const listEl = $('list');
const emptyEl = $('empty');
const countEl = $('count');
const searchEl = $('search');
const dialogEl = $('detail');

let monuments = []; // このページの区分の項目のみ
let seen = loadSeen();
let filter = 'all';
let query = '';
let current = null; // 詳細シートに表示中の項目

/* ---------- 永続化 ---------- */

function loadSeen() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw.filter(Number.isInteger) : []);
  } catch {
    return new Set();
  }
}

function saveSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen].sort((a, b) => a - b)));
  } catch {
    alert('記録を保存できませんでした。プライベートブラウズを解除してお試しください。');
  }
}

function isSeen(m) {
  return seen.has(m.id);
}

function setSeen(m, on) {
  if (on) seen.add(m.id);
  else seen.delete(m.id);
  saveSeen();
  render();
  if (current && current.id === m.id) syncDialogToggle();
}

/* ---------- 表示 ---------- */

function prefText(m) {
  return m.prefectures.join('・');
}

function matches(m) {
  if (filter === 'seen' && !isSeen(m)) return false;
  if (filter === 'unseen' && isSeen(m)) return false;
  if (!query) return true;
  const q = query.toLowerCase();
  return m.name.toLowerCase().includes(q)
    || m.kana.includes(q)
    || m.prefectures.some((p) => p.includes(q))
    || (m.note || '').includes(q);
}

function createRow(m) {
  const li = document.createElement('li');
  li.className = 'row' + (isSeen(m) ? ' done' : '');

  const check = document.createElement('button');
  check.className = 'check';
  check.setAttribute('aria-pressed', String(isSeen(m)));
  check.setAttribute('aria-label', `${m.name} を見た記録にする`);
  check.innerHTML = '<span class="box"></span>';
  check.addEventListener('click', () => setSeen(m, !isSeen(m)));

  const info = document.createElement('button');
  info.className = 'info-btn';
  info.setAttribute('aria-label', `${m.name} の詳細`);

  const names = document.createElement('div');
  names.className = 'names';

  const name = document.createElement('div');
  name.className = 'name';
  const no = document.createElement('span');
  no.className = 'no';
  no.textContent = m.no;
  name.append(no, document.createTextNode(m.name));

  const sub = document.createElement('div');
  sub.className = 'sub';
  sub.textContent = `${m.kana}｜${prefText(m)}`;

  names.append(name, sub);
  info.append(names);
  info.addEventListener('click', () => openDetail(m));

  li.append(check, info);
  return li;
}

function render() {
  const shown = monuments.filter(matches);

  const frag = document.createDocumentFragment();
  shown.forEach((m) => frag.appendChild(createRow(m)));
  listEl.replaceChildren(frag);

  emptyEl.hidden = shown.length > 0;
  countEl.textContent = shown.length ? `${shown.length}件を表示中` : '';

  const done = monuments.filter(isSeen).length;
  $('seenCount').textContent = done;
  $('totalCount').textContent = monuments.length;
  $('barFill').style.width = monuments.length ? `${(done / monuments.length) * 100}%` : '0';
}

/* ---------- 詳細シート ---------- */

function openDetail(m) {
  current = m;
  $('dName').textContent = m.name;

  const rows = [
    ['No.', `${m.no} / ${monuments.length}`],
    ['読み', m.kana],
    ['都道府県', prefText(m)],
  ];

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
  note.textContent = m.note || '';
  note.hidden = !m.note;

  syncDialogToggle();
  dialogEl.showModal();
}

function syncDialogToggle() {
  const on = isSeen(current);
  const toggle = $('dToggle');
  toggle.setAttribute('aria-pressed', String(on));
  toggle.querySelector('.visit-text').textContent = on ? '見たことがある' : '見たことを記録する';
}

$('dToggle').addEventListener('click', () => {
  if (current) setSeen(current, !isSeen(current));
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

/* ---------- 起動 ---------- */

fetch('./special-natural-monuments.json')
  .then((r) => r.json())
  .then((data) => {
    monuments = data.monuments
      .filter((m) => m.category === CATEGORY)
      .sort((a, b) => a.id - b.id);
    monuments.forEach((m, i) => { m.no = i + 1; });
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
