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
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #1a1a1a; margin-bottom: 8px;">FormGate</h2>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          以下のボタンをクリックしてログインしてください。<br/>
          このリンクは15分間有効です。
        </p>
        <div style="margin: 32px 0;">
          <a href="${magicUrl}"
             style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
            ログインする
          </a>
        </div>
        <p style="color: #999; font-size: 12px; line-height: 1.5;">
          このメールに心当たりがない場合は無視してください。<br/>
          リンク: <a href="${magicUrl}" style="color: #999; word-break: break-all;">${magicUrl}</a>
        </p>
      </div>
    `,
  });

  return true;
}
