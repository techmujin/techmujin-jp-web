/**
 * TECH MUJIN — script.js
 * 準備フェーズ用スクリプト
 *
 * 目次:
 * 1. ページ内スムーズスクロール
 * 2. ハンバーガーメニュー開閉
 *
 * TODO: 公開フェーズでの追加ポイント:
 * - Google Analytics (gtag.js) または Plausible の初期化コードを追加
 */

'use strict';

/* =============================================
   DOMContentLoaded 後に初期化
============================================= */
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initNavToggle();
});


/* =============================================
   1. ページ内スムーズスクロール
   href="#xxx" のリンクをクリックすると
   ヘッダー高さを考慮してスクロールする
============================================= */
function initSmoothScroll() {
  // ヘッダーの高さを動的に取得（固定ヘッダー対応）
  const getHeaderHeight = () => {
    const header = document.querySelector('.site-header');
    return header ? header.getBoundingClientRect().height : 0;
  };

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');

      // '#' 単体（トップへ）の処理
      if (targetId === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 対象要素を取得
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const offsetTop = targetEl.getBoundingClientRect().top
        + window.scrollY
        - getHeaderHeight()
        - 16; // 少し余裕を持たせる

      window.scrollTo({ top: offsetTop, behavior: 'smooth' });

      // スクロール後にフォーカスを移動（アクセシビリティ）
      targetEl.setAttribute('tabindex', '-1');
      targetEl.focus({ preventScroll: true });
    });
  });
}


/* =============================================
   2. ハンバーガーメニュー開閉（スマホ用）
============================================= */
function initNavToggle() {
  const toggleBtn = document.getElementById('navToggle');
  const nav = document.getElementById('globalNav');

  if (!toggleBtn || !nav) return;

  // ボタンクリックで開閉
  toggleBtn.addEventListener('click', () => {
    const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    setNavOpen(!isOpen);
  });

  // ナビリンクをクリックしたらメニューを閉じる
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      setNavOpen(false);
    });
  });

  // メニュー外クリックで閉じる
  document.addEventListener('click', (e) => {
    if (!toggleBtn.contains(e.target) && !nav.contains(e.target)) {
      setNavOpen(false);
    }
  });

  // Escape キーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setNavOpen(false);
      toggleBtn.focus();
    }
  });

  function setNavOpen(isOpen) {
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    toggleBtn.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    nav.classList.toggle('is-open', isOpen);
  }
}


/* =============================================
   TODO: 将来追加予定の処理メモ

   ■ Google Analytics 4 の初期化
   window.dataLayer = window.dataLayer || [];
   function gtag(){ dataLayer.push(arguments); }
   gtag('js', new Date());
   gtag('config', 'GA_MEASUREMENT_ID');

   ■ Plausible Analytics
   <script defer data-domain="techmujin.jp" src="https://plausible.io/js/script.js"></script>

   ■ お知らせの動的読み込み（CMS/JSON 移行後）
   fetch('/data/news.json')
     .then(r => r.json())
     .then(items => renderNews(items));

   ■ 公開フェーズ向け追加セクション（HTML側にコメントあり）
   - タイムテーブルセクション
   - 参加方法セクション
   - 参加コミュニティ一覧セクション
============================================= */


