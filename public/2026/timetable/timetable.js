/**
 * TECH MUJIN 2026 — timetable.js
 *
 * techmujin-api からタイムテーブルを取得して描画する。
 * レスポンスの形は https://github.com/techmujin/techmujin-api の src/schema.ts を参照。
 *
 * 中身はスプレッドシート由来なので、文字列はすべて textContent で入れ、
 * innerHTML は使わない。descriptionMarkdown は描画しない（サニタイズの仕組みを入れるまで）
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('tt');
  if (!root) return;
  loadTimetable(root);
});

async function loadTimetable(root) {
  const status = document.getElementById('ttStatus');

  try {
    const response = await fetch(root.dataset.endpoint, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const timetable = await response.json();
    if (timetable.schemaVersion !== 1) throw new Error(`Unsupported schemaVersion: ${timetable.schemaVersion}`);

    root.replaceChildren(renderTimetable(timetable.sessions));
    scrollToHash();
  } catch (error) {
    console.error(error);
    status.textContent = '';
    status.append(
      'タイムテーブルを読み込めませんでした。時間をおいて再読み込みしてください。おおまかな流れは',
      el('a', { href: '../#timetable' }, 'トップページ'),
      'でご覧いただけます。'
    );
    status.dataset.status = 'error';
  }
}


/* =============================================
   描画
   連続する同じ group のセッションは、見出し付きの1ブロックにまとめる
============================================= */
function renderTimetable(sessions) {
  const list = el('ol', { class: 'tt-list' });
  let currentGroup = null;

  sessions.forEach((session) => {
    if (!session.group) {
      currentGroup = null;
      list.append(renderSession(session));
      return;
    }

    if (!currentGroup || currentGroup.name !== session.group) {
      currentGroup = { name: session.group, items: el('ol', { class: 'tt-group-items' }), first: session };
      currentGroup.time = el('p', { class: 'tt-group-time' });
      // トップページから group 名でリンクするので、見出しをそのまま id にする
      list.append(el('li', { class: 'tt-group', id: session.group },
        el('div', { class: 'tt-group-head' },
          el('h2', { class: 'tt-group-title' }, session.group),
          currentGroup.time
        ),
        currentGroup.items
      ));
    }

    currentGroup.items.append(renderSession(session));
    currentGroup.time.replaceChildren(...renderTimeRange(currentGroup.first.startsAt, session.endsAt));
  });

  return list;
}

function renderSession(session) {
  const body = el('div', { class: 'tt-body' });

  const title = el('h3', { class: 'tt-title' }, session.title);
  if (session.isCancelled) {
    title.prepend(el('span', { class: 'tt-badge' }, '中止'));
  }
  body.append(title);

  if (session.speakers.length) {
    body.append(el('ul', { class: 'tt-speakers', 'aria-label': '登壇者' },
      ...session.speakers.map(renderSpeaker)
    ));
  }

  if (session.communities.length) {
    body.append(el('ul', { class: 'tt-communities', 'aria-label': 'コミュニティ' },
      ...session.communities.map((community) => {
        const url = safeUrl(community.url);
        return el('li', {}, url
          ? el('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, community.name)
          : community.name);
      })
    ));
  }

  if (session.message) {
    body.append(el('p', { class: 'tt-message' }, session.message));
  }

  const links = session.links.filter((link) => safeUrl(link.url));
  if (links.length) {
    body.append(el('ul', { class: 'tt-links' },
      ...links.map((link) => el('li', {},
        el('a', { href: link.url, target: '_blank', rel: 'noopener noreferrer' }, link.label)
      ))
    ));
  }

  const item = el('li', { class: 'tt-item', 'data-kind': session.kind },
    el('p', { class: 'tt-time' }, ...renderTimeRange(session.startsAt, session.endsAt)),
    body
  );
  if (session.isCancelled) item.dataset.cancelled = '';
  return item;
}

function renderSpeaker(speaker) {
  const item = el('li', { class: 'tt-speaker' });
  const iconUrl = safeUrl(speaker.iconUrl);
  if (iconUrl) {
    // 名前を隣に書くので、画像は装飾として扱う
    item.append(el('img', { src: iconUrl, alt: '', width: '28', height: '28', loading: 'lazy', decoding: 'async' }));
  }
  item.append(el('span', {}, speaker.name));
  return item;
}

function renderTimeRange(startsAt, endsAt) {
  return [
    el('time', { datetime: startsAt }, formatTime(startsAt)),
    el('span', { class: 'tt-time-sep', 'aria-label': 'から' }, '–'),
    el('time', { datetime: endsAt }, formatTime(endsAt))
  ];
}


/* =============================================
   小物
============================================= */

// 中身は読み込み後に描画するので、ブラウザ標準の # へのジャンプは空振りする。描画後にやり直す
function scrollToHash() {
  if (!location.hash) return;
  let id;
  try {
    id = decodeURIComponent(location.hash.slice(1));
  } catch {
    return;
  }
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ block: 'start' });
}

// API の時刻は常に +09:00 固定なので、閲覧者のタイムゾーンに関係なく文字列から時:分を取り出す
function formatTime(iso) {
  const [hour, minute] = iso.slice(11, 16).split(':');
  return `${Number(hour)}:${minute}`;
}

function safeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([name, value]) => node.setAttribute(name, value));
  node.append(...children);
  return node;
}
