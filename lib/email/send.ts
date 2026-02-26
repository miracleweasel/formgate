// lib/email/send.ts
import { Resend } from "resend";
import { getResendApiKey, getEmailFrom, ENV } from "@/lib/env";

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

/**
 * Send a submission notification email to the form owner.
 * Returns true if sent, false if Resend is not configured.
 */
export async function sendSubmissionNotification(
  ownerEmail: string,
  formName: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const resend = getResend();

  if (!resend) {
    // Dev mode: log to console
    console.log(
      `[dev] Submission notification for ${ownerEmail} (form: ${formName}):`,
      payload,
    );
    return true;
  }

  const from = `FormGate <${getEmailFrom()}>`;
  const subject = `[FormGate] ${formName} に新しい送信がありました`;

  await resend.emails.send({
    from,
    to: ownerEmail,
    subject,
    html: buildSubmissionNotificationHtml(formName, payload),
    text: buildSubmissionNotificationText(formName, payload),
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

// ---------------------------------------------------------------------------
// Welcome email
// ---------------------------------------------------------------------------

/**
 * Send a welcome email to a new user on first signup.
 * Returns true if sent, false if Resend is not configured.
 */
export async function sendWelcomeEmail(email: string): Promise<boolean> {
  const resend = getResend();

  if (!resend) {
    // Dev mode: log to console
    console.log(`[dev] Welcome email for ${email}`);
    return true;
  }

  const from = `FormGate <${getEmailFrom()}>`;

  await resend.emails.send({
    from,
    to: email,
    subject: "FormGateへようこそ！",
    html: buildWelcomeHtml(),
    text: buildWelcomeText(),
  });

  return true;
}

// ---------------------------------------------------------------------------
// Submission notification builders
// ---------------------------------------------------------------------------

/** Escape HTML special characters to prevent XSS in emails */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildSubmissionNotificationHtml(
  formName: string,
  payload: Record<string, unknown>,
): string {
  const safeFormName = escapeHtml(formName);

  const rows = Object.entries(payload)
    .map(([key, value]) => {
      const safeKey = escapeHtml(String(key));
      const safeValue = escapeHtml(String(value ?? ""));
      return `<tr>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:13px;font-weight:600;white-space:nowrap;vertical-align:top;">${safeKey}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#1a1a1a;font-size:14px;line-height:1.6;word-break:break-word;">${safeValue}</td>
      </tr>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans JP',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
  <!-- Header -->
  <tr><td style="padding:32px 32px 0;">
    <div style="font-size:20px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px;">FormGate</div>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:24px 32px;">
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 8px;">
      <strong>${safeFormName}</strong> に新しいフォーム送信がありました。
    </p>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 20px;">
      以下が送信内容です：
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;border-collapse:collapse;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;">項目</th>
          <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;">内容</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </td></tr>
  <!-- Divider -->
  <tr><td style="padding:0 32px;"><div style="border-top:1px solid #e5e7eb;"></div></td></tr>
  <!-- Footer -->
  <tr><td style="padding:20px 32px 28px;">
    <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0;">
      このメールはFormGateのフォーム送信通知です。フォームの設定はダッシュボードから管理できます。
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function buildSubmissionNotificationText(
  formName: string,
  payload: Record<string, unknown>,
): string {
  const lines = Object.entries(payload)
    .map(([key, value]) => `${key}: ${String(value ?? "")}`)
    .join("\n");

  return `[FormGate] ${formName} に新しい送信がありました

フォーム「${formName}」に新しい送信がありました。

送信内容：
${lines}

---
このメールはFormGateのフォーム送信通知です。`;
}

// ---------------------------------------------------------------------------
// Welcome email builders
// ---------------------------------------------------------------------------

function buildWelcomeHtml(): string {
  const formsUrl = `${ENV.APP_URL}/forms`;

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
      FormGateへようこそ！
    </p>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
      アカウントの登録が完了しました。以下の3ステップで、フォームからBacklogへの自動連携をすぐに始められます。
    </p>
    <!-- Steps -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td style="padding:12px 16px;background:#f9fafb;border-radius:8px;margin-bottom:8px;">
        <table cellpadding="0" cellspacing="0" width="100%"><tr>
          <td width="32" style="vertical-align:top;">
            <div style="width:24px;height:24px;border-radius:50%;background:#6366f1;color:#ffffff;font-size:13px;font-weight:700;text-align:center;line-height:24px;">1</div>
          </td>
          <td style="padding-left:12px;">
            <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 2px;">フォームを作成する</p>
            <p style="color:#6b7280;font-size:13px;margin:0;">ダッシュボードから新しいフォームを作成しましょう。</p>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="height:8px;"></td></tr>
      <tr><td style="padding:12px 16px;background:#f9fafb;border-radius:8px;">
        <table cellpadding="0" cellspacing="0" width="100%"><tr>
          <td width="32" style="vertical-align:top;">
            <div style="width:24px;height:24px;border-radius:50%;background:#6366f1;color:#ffffff;font-size:13px;font-weight:700;text-align:center;line-height:24px;">2</div>
          </td>
          <td style="padding-left:12px;">
            <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 2px;">Backlogを接続する</p>
            <p style="color:#6b7280;font-size:13px;margin:0;">設定画面でBacklogのスペースとAPIキーを登録してください。</p>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="height:8px;"></td></tr>
      <tr><td style="padding:12px 16px;background:#f9fafb;border-radius:8px;">
        <table cellpadding="0" cellspacing="0" width="100%"><tr>
          <td width="32" style="vertical-align:top;">
            <div style="width:24px;height:24px;border-radius:50%;background:#6366f1;color:#ffffff;font-size:13px;font-weight:700;text-align:center;line-height:24px;">3</div>
          </td>
          <td style="padding-left:12px;">
            <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 2px;">公開URLを共有する</p>
            <p style="color:#6b7280;font-size:13px;margin:0;">フォームの公開URLをチームやお客様に共有して、送信を受け付けましょう。</p>
          </td>
        </tr></table>
      </td></tr>
    </table>
    <!-- CTA Button -->
    <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
      <a href="${formsUrl}"
         style="display:inline-block;background:#6366f1;color:#ffffff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:0.2px;">
        ダッシュボードを開く
      </a>
    </td></tr></table>
  </td></tr>
  <!-- Divider -->
  <tr><td style="padding:0 32px;"><div style="border-top:1px solid #e5e7eb;"></div></td></tr>
  <!-- Footer -->
  <tr><td style="padding:20px 32px 28px;">
    <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0;">
      ご不明な点がございましたら、お気軽にお問い合わせください。FormGateをご利用いただきありがとうございます。
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function buildWelcomeText(): string {
  const formsUrl = `${ENV.APP_URL}/forms`;

  return `FormGateへようこそ！

アカウントの登録が完了しました。以下の3ステップで、フォームからBacklogへの自動連携をすぐに始められます。

1. フォームを作成する
   ダッシュボードから新しいフォームを作成しましょう。

2. Backlogを接続する
   設定画面でBacklogのスペースとAPIキーを登録してください。

3. 公開URLを共有する
   フォームの公開URLをチームやお客様に共有して、送信を受け付けましょう。

ダッシュボードを開く: ${formsUrl}

---
ご不明な点がございましたら、お気軽にお問い合わせください。FormGateをご利用いただきありがとうございます。`;
}
