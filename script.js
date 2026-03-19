/**
 * TECH MUJIN — script.js
 * 準備フェーズ用スクリプト
 *
 * 目次:
 * 1. ページ内スムーズスクロール
 * 2. ハンバーガーメニュー開閉
 * 3. お問い合わせフォームのダミー送信処理
 *
 * TODO: 公開フェーズでの追加ポイント:
 * - Google Analytics (gtag.js) または Plausible の初期化コードを追加
 * - フォーム送信処理を実際のフォームサービス（Formspree / formrun / Google Forms など）に切り替える
 * - お知らせを JSON または CMS から動的取得する処理を追加
 */

'use strict';

/* =============================================
   DOMContentLoaded 後に初期化
============================================= */
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initNavToggle();
  initContactForm();
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
   3. お問い合わせフォームのダミー送信処理
   現在はデモのため実際の送信は行わない。
   公開フェーズで以下のように切り替える:
   - fetch() を使って API エンドポイントに POST する
   - または form の action / method を変更して外部サービスへ送信する
============================================= */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const resultEl = document.getElementById('formResult');

  if (!form || !resultEl) return;

  form.addEventListener('submit', (e) => {
    // デモ: 送信をキャンセル
    e.preventDefault();

    // バリデーション（ブラウザネイティブ）
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // フォームデータの取得（実装時はここで fetch に渡す）
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // TODO: 本番フォームへの接続処理をここに記述する
    // 例:
    // fetch('https://your-form-service.example.com/submit', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // })
    // .then(res => res.json())
    // .then(() => showResult('success', 'お問い合わせを受け付けました。'))
    // .catch(() => showResult('error', '送信に失敗しました。時間をおいて再度お試しください。'));

    // デモ用: 画面内メッセージを表示
    console.log('[TECH MUJIN] フォームデータ (デモ):', data);
    showResult(
      'info',
      'このデモでは送信機能は未実装です。\n公開フェーズで実際のフォームサービスに接続予定です。'
    );

    // 送信ボタンを一時的に無効化（二重送信防止の例）
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      setTimeout(() => { submitBtn.disabled = false; }, 3000);
    }
  });

  /**
   * フォーム下部に結果メッセージを表示する
   * @param {'info'|'success'|'error'} type
   * @param {string} message
   */
  function showResult(type, message) {
    resultEl.className = `form-result is-${type}`;
    resultEl.textContent = message;
    resultEl.hidden = false;

    // フォーカスを結果メッセージに移動（アクセシビリティ）
    resultEl.setAttribute('tabindex', '-1');
    resultEl.focus({ preventScroll: false });

    // 一定時間後に非表示（オプション）
    // setTimeout(() => { resultEl.hidden = true; }, 8000);
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
