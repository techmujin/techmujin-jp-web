/**
 * TECH MUJIN 2026 — script.js
 *
 * 1. ヘッダーのスクロール状態
 * 2. モバイルメニュー
 * 3. 現在地のナビ表示
 * 4. スクロール演出
 * 5. お問い合わせフォーム
 */

'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initHeaderState();
  initMobileMenu();
  initActiveNav();
  initReveal();
  initContactForm();
});


/* =============================================
   1. ヘッダーのスクロール状態
   ヒーロー上は透過、スクロール後は地色＋境界線
============================================= */
function initHeaderState() {
  const header = document.getElementById('header');
  if (!header) return;

  const update = () => {
    header.dataset.state = window.scrollY > 40 ? 'scrolled' : 'top';
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}


/* =============================================
   2. モバイルメニュー（フルスクリーンオーバーレイ）
============================================= */
function initMobileMenu() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (!burger || !nav) return;

  const setOpen = (isOpen) => {
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    nav.classList.toggle('is-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  burger.addEventListener('click', () => {
    setOpen(burger.getAttribute('aria-expanded') !== 'true');
  });

  // メニュー内のリンクを押したら閉じる
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      burger.focus();
    }
  });

  // PC幅に戻したときに開きっぱなしを防ぐ
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}


/* =============================================
   3. 現在地のナビ表示
============================================= */
function initActiveNav() {
  const links = Array.from(document.querySelectorAll('.nav-link'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  const byId = new Map();
  const sections = [];

  links.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (!section) return;
    byId.set(id, link);
    sections.push(section);
  });

  // 交差中のセクションを保持し、そのうち文書順で最初のものを現在地とする。
  // エントリの到着順に任せると、隣り合うセクションの切り替わりで前の節が勝ってしまう
  const visible = new Set();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visible.add(entry.target.id);
      } else {
        visible.delete(entry.target.id);
      }
    });

    const currentId = sections.map((s) => s.id).find((id) => visible.has(id));
    links.forEach((l) => l.removeAttribute('aria-current'));
    if (currentId) byId.get(currentId).setAttribute('aria-current', 'true');
  }, {
    // 画面上部 1/4 あたりに入ったセクションを現在地とみなす
    rootMargin: '-15% 0px -75% 0px',
    threshold: 0
  });

  sections.forEach((section) => observer.observe(section));
}


/* =============================================
   4. スクロール演出
   同じ親を持つ要素は少しずつ遅らせて出す
============================================= */
function initReveal() {
  const targets = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!targets.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      obs.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  targets.forEach((el) => {
    const siblings = Array.from(el.parentElement.children).filter((n) => n.hasAttribute('data-reveal'));
    const index = siblings.indexOf(el);
    if (index > 0) {
      el.style.transitionDelay = `${Math.min(index, 6) * 70}ms`;
    }
    // 隠すのは監視を始める直前だけ。監視できなければ表示したまま
    el.classList.add('reveal-ready');
    observer.observe(el);
  });
}


/* =============================================
   5. お問い合わせフォーム
   入力内容を /api/contact に送信する
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
      setStatus(status, '認証を完了してから送信してください。', 'error');
      return;
    }

    setPending(submitButton, true);
    setStatus(status, '送信しています。', 'info');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setStatus(status, 'お問い合わせを送信しました。ありがとうございます。', 'success');
    } catch {
      resetTurnstileWidget();
      setStatus(status, '送信できませんでした。時間をおいてもう一度お試しください。', 'error');
    } finally {
      setPending(submitButton, false);
    }
  });
}

function setPending(button, isPending) {
  if (!button) return;
  button.disabled = isPending;
  button.textContent = isPending ? '送信中...' : '送信する';
}

function setStatus(status, message, type) {
  if (!status) return;
  status.textContent = message;
  status.dataset.status = type;
}

function resetTurnstileWidget() {
  if (window.turnstile) {
    window.turnstile.reset();
  }
}
