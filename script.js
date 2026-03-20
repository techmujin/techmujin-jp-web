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
  initBlog();
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


/* =============================================
   4. 運営ブログ記事の取得・表示
   noteマガジンのRSSフィードから記事を取得して
   ブログセクションに動的に表示する
============================================= */
function initBlog() {
  console.log('[TECH MUJIN] ブログ初期化を開始');
  
  const blogList = document.getElementById('blogList');
  const blogLoading = document.getElementById('blogLoading');
  const blogError = document.getElementById('blogError');

  // 要素の確認
  if (!blogList || !blogLoading || !blogError) {
    console.error('[TECH MUJIN] ブログ要素が見つかりません');
    return;
  }

  console.log('[TECH MUJIN] ブログ要素を取得しました');

  // 初期状態: ローディング表示、他を非表示
  blogLoading.style.display = 'flex';
  blogLoading.hidden = false;
  blogLoading.setAttribute('aria-hidden', 'false');
  
  blogError.style.display = 'none';
  blogError.hidden = true;
  blogError.setAttribute('aria-hidden', 'true');
  
  blogList.style.display = 'none';
  blogList.hidden = true;
  blogList.setAttribute('aria-hidden', 'true');

  console.log('[TECH MUJIN] ローディング状態に設定しました');

  // RSS フィードから実際に取得を試行
  const rssUrl = 'https://note.com/techmujin/m/m61bd7c72cd8c/rss';
  
  // CORS プロキシサービスを使用してRSS取得を試行
  fetchRSSFeed(rssUrl, blogList, blogLoading, blogError);
}

/**
 * RSS フィードから記事データを取得
 * @param {string} rssUrl 
 * @param {HTMLElement} blogList 
 * @param {HTMLElement} blogLoading 
 * @param {HTMLElement} blogError 
 */
async function fetchRSSFeed(rssUrl, blogList, blogLoading, blogError) {
  try {
    console.log('[TECH MUJIN] RSS取得を開始:', rssUrl);
    
    // 複数のCORSプロキシサービスを試行
    const corsProxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`
    ];
    
    let rssData = null;
    
    for (const proxyUrl of corsProxies) {
      try {
        console.log('[TECH MUJIN] プロキシを試行:', proxyUrl);
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/rss+xml, application/xml, text/xml, */*'
          }
        });
        
        if (response.ok) {
          const xmlText = await response.text();
          console.log('[TECH MUJIN] RSS取得成功、XMLパース開始');
          
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
          
          // パースエラーチェック
          const parserError = xmlDoc.querySelector('parsererror');
          if (parserError) {
            throw new Error('XMLパースエラー');
          }
          
          const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, 5);
          
          if (items.length > 0) {
            console.log(`[TECH MUJIN] ${items.length}件の記事を取得`);
            
            const posts = items.map(item => ({
              title: item.querySelector('title')?.textContent?.trim() || 'タイトル不明',
              link: item.querySelector('link')?.textContent?.trim() || item.querySelector('guid')?.textContent?.trim() || 'https://note.com/techmujin',
              pubDate: item.querySelector('pubDate')?.textContent?.trim() || new Date().toISOString(),
              description: item.querySelector('description')?.textContent?.trim() || ''
            }));
            
            renderBlogPosts(posts, blogList, blogLoading, blogError, false);
            return;
          }
        }
        
      } catch (proxyError) {
        console.warn('[TECH MUJIN] プロキシ失敗:', proxyError);
        continue;
      }
    }
    
    throw new Error('全てのプロキシサービスで取得に失敗');
    
  } catch (error) {
    console.error('[TECH MUJIN] RSS取得エラー:', error);
    showBlogError(blogLoading, blogError);
  }
}

/**
 * ブログ記事を画面に表示
 * @param {Array} posts 
 * @param {HTMLElement} blogList 
 * @param {HTMLElement} blogLoading 
 * @param {HTMLElement} blogError 
 * @param {boolean} showNotice 
 */
function renderBlogPosts(posts, blogList, blogLoading, blogError, showNotice = false) {
  console.log('[TECH MUJIN] 記事表示開始:', posts?.length);
  
  if (!posts || posts.length === 0) {
    console.log('[TECH MUJIN] 表示する記事がありません - エラー表示に切り替え');
    showBlogError(blogLoading, blogError);
    return;
  }
  
  // 成功時: 全ての状態を確実にリセット
  console.log('[TECH MUJIN] 記事表示のため全状態をリセット');
  
  // CSSクラスと属性で確実に制御
  blogLoading.style.display = 'none';
  blogLoading.hidden = true;
  blogLoading.setAttribute('aria-hidden', 'true');
  
  blogError.style.display = 'none';
  blogError.hidden = true;
  blogError.setAttribute('aria-hidden', 'true');
  
  // 記事リストをクリア
  blogList.innerHTML = '';
  
  // 各記事を表示
  posts.forEach((post, index) => {
    console.log(`[TECH MUJIN] 記事${index + 1}: ${post.title}`);
    
    const listItem = document.createElement('li');
    listItem.className = 'blog-item';
    
    // 日付の整形
    let formattedDate = '日付不明';
    try {
      const publishDate = new Date(post.pubDate);
      if (!isNaN(publishDate.getTime())) {
        formattedDate = publishDate.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\//g, '.');
      }
    } catch (e) {
      console.warn('[TECH MUJIN] 日付パースエラー:', e);
    }
    
    // 抜粋の作成
    const plainText = post.description?.replace(/<[^>]*>/g, '') || '';
    const excerpt = plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText;
    
    // 本文内のAタグを処理した抜粋を作成
    const processedExcerpt = processDescriptionLinks(post.description || '');
    
    listItem.innerHTML = `
      <h3 class="blog-item-title">
        <a href="${escapeHtml(post.link)}" class="blog-item-link" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(post.title)}
        </a>
      </h3>
      <div class="blog-item-meta">
        <time class="blog-item-date" datetime="${post.pubDate}">${formattedDate}</time>
      </div>
      ${processedExcerpt ? `<div class="blog-item-excerpt">${processedExcerpt}</div>` : ''}
    `;
    
    blogList.appendChild(listItem);
  });
  
  // 記事リストを確実に表示
  blogList.style.display = 'block';
  blogList.hidden = false;
  blogList.setAttribute('aria-hidden', 'false');
  
  console.log('[TECH MUJIN] 記事表示完了 - 状態:', {
    loading: blogLoading.hidden,
    error: blogError.hidden,
    list: blogList.hidden
  });
}

/**
 * エラー表示
 * @param {HTMLElement} blogLoading 
 * @param {HTMLElement} blogError 
 */
function showBlogError(blogLoading, blogError) {
  console.log('[TECH MUJIN] エラー表示に切り替え');
  
  // エラー時: 全ての状態を確実にリセット
  blogLoading.style.display = 'none';
  blogLoading.hidden = true;
  blogLoading.setAttribute('aria-hidden', 'true');
  
  blogError.style.display = 'flex';
  blogError.hidden = false;
  blogError.setAttribute('aria-hidden', 'false');
  
  const blogList = document.getElementById('blogList');
  if (blogList) {
    blogList.style.display = 'none';
    blogList.hidden = true;
    blogList.setAttribute('aria-hidden', 'true');
  }
  
  console.log('[TECH MUJIN] エラー表示完了 - 状態:', {
    loading: blogLoading.hidden,
    error: blogError.hidden,
    list: blogList ? blogList.hidden : 'N/A'
  });
}

/**
 * 記事の本文からAタグのみを保持した安全な抜粋を生成
 * @param {string} description 
 * @returns {string}
 */
function processDescriptionLinks(description) {
  if (!description) return '';
  
  try {
    // HTMLをパースして安全に処理
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    
    // Aタグ以外の全てのタグを除去し、テキストコンテンツのみ保持
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName.toLowerCase() === 'a') {
          // Aタグは保持するが、属性を安全に処理
          const href = node.getAttribute('href');
          const text = node.textContent;
          
          if (href && text) {
            // 外部リンクに必要な属性を追加
            return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`;
          }
          return escapeHtml(text);
        } else {
          // その他のタグは中身のテキストのみ保持
          return Array.from(node.childNodes).map(processNode).join('');
        }
      }
      
      return '';
    };
    
    const processed = Array.from(tempDiv.childNodes).map(processNode).join('');
    
    // 150文字制限を適用（HTMLタグを考慮）
    const tempForLength = document.createElement('div');
    tempForLength.innerHTML = processed;
    const textLength = tempForLength.textContent.length;
    
    if (textLength <= 150) {
      return processed;
    }
    
    // 長い場合は安全に切り詰める
    let truncated = processed;
    while (tempForLength.textContent.length > 147) { // '...' の分を考慮
      truncated = truncated.slice(0, -1);
      tempForLength.innerHTML = truncated;
    }
    
    return truncated + '...';
    
  } catch (error) {
    console.warn('[TECH MUJIN] 本文処理エラー:', error);
    // エラー時は安全にプレーンテキストとして処理
    const plainText = description.replace(/<[^>]*>/g, '');
    return escapeHtml(plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText);
  }
}

/**
 * HTMLエスケープ処理
 * @param {string} str 
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
