# お問い合わせフォーム運用メモ

このサイトのお問い合わせフォームは、Cloudflare Worker の `/api/contact` に送信し、Worker から Resend API 経由で運営宛にメールを送ります。

## 必要な外部設定

1. Resend で送信ドメインを認証する
2. Resend の API key を作成する
3. Cloudflare Turnstile の widget を作成する
4. Cloudflare Worker に以下を設定する

## Cloudflare の環境変数

Secrets:

```sh
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Variables:

```text
TURNSTILE_SITE_KEY=...
CONTACT_TO=info@techmujin.jp
CONTACT_FROM=テック無尽 <noreply@notify.techmujin.jp>
```

`CONTACT_TO` と `CONTACT_FROM` は `wrangler.jsonc` にも既定値があります。`CONTACT_FROM` には Resend で認証済みの `notify.techmujin.jp` を使います。

## ローカル確認

`.dev.vars.example` を参考に `.dev.vars` を作成してから、Wrangler のローカルサーバーを起動します。

```sh
npx wrangler dev
```

`.dev.vars` は `.gitignore` で除外されています。API key や Turnstile secret key はコミットしないでください。
