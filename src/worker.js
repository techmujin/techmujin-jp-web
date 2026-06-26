const RESEND_API_URL = 'https://api.resend.com/emails';
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      return handleContactRequest(request, env);
    }

    return handleAssetRequest(request, env);
  }
};

async function handleAssetRequest(request, env) {
  const response = await env.ASSETS.fetch(request);
  const contentType = response.headers.get('Content-Type') || '';

  if (!contentType.includes('text/html')) {
    return response;
  }

  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.delete('Content-Length');

  return new Response(html.replace('__TURNSTILE_SITE_KEY__', env.TURNSTILE_SITE_KEY || ''), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function handleContactRequest(request, env) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405, {
      Allow: 'POST'
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }

  const contact = normalizeContactPayload(payload);
  const validationError = validateContactPayload(contact);
  if (validationError) {
    return jsonResponse({ error: validationError }, 400);
  }

  const turnstileResult = await verifyTurnstileToken(contact.turnstileToken, env);
  if (!turnstileResult.success) {
    return jsonResponse({ error: 'turnstile_failed' }, 400);
  }

  const resendResult = await sendContactEmail(contact, env);
  if (!resendResult.ok) {
    return jsonResponse({ error: 'email_delivery_failed' }, 502);
  }

  return jsonResponse({ ok: true });
}

function normalizeContactPayload(payload) {
  return {
    name: normalizeText(payload.name),
    email: normalizeText(payload.email),
    subject: normalizeText(payload.subject),
    message: normalizeText(payload.message),
    turnstileToken: normalizeText(payload.turnstileToken)
  };
}

function normalizeText(value) {
  return String(value || '').trim();
}

function validateContactPayload(contact) {
  if (!contact.name) return 'name_required';
  if (!contact.email) return 'email_required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) return 'email_invalid';
  if (!contact.subject) return 'subject_required';
  if (!contact.message) return 'message_required';
  if (!contact.turnstileToken) return 'turnstile_required';
  if (contact.name.length > 100) return 'name_too_long';
  if (contact.email.length > 254) return 'email_too_long';
  if (contact.subject.length > 100) return 'subject_too_long';
  if (contact.message.length > 4000) return 'message_too_long';
  return null;
}

async function verifyTurnstileToken(token, env) {
  if (!env.TURNSTILE_SECRET_KEY) {
    return { success: false };
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token
    })
  });

  if (!response.ok) {
    return { success: false };
  }

  return response.json();
}

async function sendContactEmail(contact, env) {
  if (!env.RESEND_API_KEY) {
    return { ok: false };
  }

  const subject = `【テック無尽】お問い合わせ: ${contact.subject}`;
  const text = [
    'テック無尽へのお問い合わせ',
    '',
    `お名前: ${contact.name}`,
    `メールアドレス: ${contact.email}`,
    `お問い合わせ種別: ${contact.subject}`,
    '',
    'お問い合わせ内容:',
    contact.message
  ].join('\n');

  return fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: contact.email,
      subject,
      text
    })
  });
}

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    }
  });
}
