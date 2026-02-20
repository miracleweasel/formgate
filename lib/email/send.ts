// lib/email/send.ts
import { Resend } from "resend";
import { getResendApiKey, getEmailFrom } from "@/lib/env";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (resendClient) return resendClient;
  const apiKey = getResendApiKey();
  if (!apiKey) return null;
  resendClient = new Resend(apiKey);
  return resendClient;
}

/**
 * Send a magic link email.
 * Returns true if sent, false if Resend is not configured.
 */
export async function sendMagicLinkEmail(email: string, magicUrl: string): Promise<boolean> {
  const resend = getResend();

  if (!resend) {
    // Dev mode: log the link to console
    console.log(`[dev] Magic link for ${email}: ${magicUrl}`);
    return true;
  }

  const from = `FormGate <${getEmailFrom()}>`;

  await resend.emails.send({
    from,
    to: email,
    subject: "FormGate ログインリンク",
    html: buildMagicLinkHtml(magicUrl),
    text: buildMagicLinkText(magicUrl),
  });

  return true;
}

// ---------------------------------------------------------------------------
// Email HTML/Text builders
// ---------------------------------------------------------------------------

function buildMagicLinkHtml(magicUrl: string): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans JP',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:480px;width:100%;">
  <!-- Header -->
  <tr><td style="padding:32px 32px 0;">
    <div style="font-size:20px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px;">FormGate</div>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:24px 32px;">
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 8px;">
      FormGateへのログインリンクです。
    </p>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 28px;">
      以下のボタンをクリックしてログインしてください。このリンクは<strong>15分間</strong>有効です。
    </p>
    <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
      <a href="${magicUrl}"
         style="display:inline-block;background:#6366f1;color:#ffffff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:0.2px;">
        ログインする
      </a>
    </td></tr></table>
  </td></tr>
  <!-- Divider -->
  <tr><td style="padding:0 32px;"><div style="border-top:1px solid #e5e7eb;"></div></td></tr>
  <!-- Footer -->
  <tr><td style="padding:20px 32px 28px;">
    <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0 0 12px;">
      このメールに心当たりがない場合は無視してください。アカウントへの影響はありません。
    </p>
    <p style="color:#9ca3af;font-size:11px;line-height:1.5;margin:0;word-break:break-all;">
      ボタンが機能しない場合:<br/>
      <a href="${magicUrl}" style="color:#9ca3af;">${magicUrl}</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function buildMagicLinkText(magicUrl: string): string {
  return `FormGate ログインリンク

以下のURLをクリックしてログインしてください。
このリンクは15分間有効です。

${magicUrl}

このメールに心当たりがない場合は無視してください。`;
}
