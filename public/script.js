/**
 * TECH MUJIN — script.js
 * 準備フェーズ用スクリプト
 *
 * 目次:
 * 1. ページ内スムーズスクロール
 * 2. ハンバーガーメニュー開閉
 * 3. お問い合わせフォーム
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
   3. お問い合わせフォーム
   入力内容を API に送信する
============================================= */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const status = document.getElementById('contactFormStatus');
  const submitButton = form.querySelector('.contact-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const turnstileToken = String(formData.get('cf-turnstile-response') || '').trim();

    if (!turnstileToken) {
      setContactFormStatus(status, '認証を完了してから送信してください。', 'error');
      return;
    }

    setContactFormPending(submitButton, true);
    setContactFormStatus(status, '送信しています。', 'info');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: String(formData.get('name') || '').trim(),
          email: String(formData.get('email') || '').trim(),
          subject: String(formData.get('subject') || '').trim(),
          message: String(formData.get('message') || '').trim(),
          turnstileToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit contact form');
      }

      form.reset();
      resetTurnstileWidget();
      setContactFormStatus(status, 'お問い合わせを送信しました。ありがとうございます。', 'success');
    } catch {
      resetTurnstileWidget();
      setContactFormStatus(status, '送信できませんでした。時間をおいてもう一度お試しください。', 'error');
    } finally {
      setContactFormPending(submitButton, false);
    }
  });
}

function setContactFormPending(button, isPending) {
  if (!button) return;

  button.disabled = isPending;
  button.textContent = isPending ? '送信中...' : '送信する';
}

function setContactFormStatus(status, message, type) {
  if (!status) return;

  status.textContent = message;
  status.dataset.status = type;
}

function resetTurnstileWidget() {
  if (window.turnstile) {
    window.turnstile.reset();
  }
}
