/**
 * Email helper. Uses Resend when RESEND_API_KEY is set; falls back to console stub.
 *
 * All emails intentionally avoid AI / tech language in body copy.
 * Keep tone: warm, premium, simple, reassuring.
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const adminEmail = process.env.ADMIN_EMAIL ?? "hello@placeportraits.co.uk";

type SendResult = { success: boolean; error?: string };

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email stub] To: ${to} | Subject: ${subject}`);
    return { success: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: `Place Portraits <noreply@placeportraits.co.uk>`,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (err) {
    console.error("[email] Send failed:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendPreviewRequestReceived({
  customerName,
  customerEmail,
}: {
  customerName: string;
  customerEmail: string;
}): Promise<SendResult> {
  return sendEmail({
    to: customerEmail,
    subject: "We've received your home artwork request",
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1c1a17;">
        <h2 style="font-size: 22px; font-weight: normal; margin-bottom: 8px;">
          Thank you, ${customerName}
        </h2>
        <p style="color: #6b5e4e; line-height: 1.7;">
          We've received your request for a personalised home artwork preview.
          Our team is creating your preview and we'll be in touch as soon as it's ready.
        </p>
        <p style="color: #6b5e4e; line-height: 1.7;">
          If you have any questions in the meantime, feel free to reply to this email.
        </p>
        <p style="margin-top: 32px; color: #8a7968; font-size: 13px;">
          — The Place Portraits team
        </p>
      </div>
    `,
  });
}

export async function sendPreviewReady({
  customerName,
  customerEmail,
  previewToken,
}: {
  customerName: string;
  customerEmail: string;
  previewToken: string;
}): Promise<SendResult> {
  const previewUrl = `${siteUrl}/preview/${previewToken}`;
  return sendEmail({
    to: customerEmail,
    subject: "Your personalised home artwork preview is ready",
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1c1a17;">
        <h2 style="font-size: 22px; font-weight: normal; margin-bottom: 8px;">
          Your artwork preview is ready, ${customerName}
        </h2>
        <p style="color: #6b5e4e; line-height: 1.7;">
          Your personalised home artwork preview is ready to view. Click below to see your artwork
          and choose your size and finish.
        </p>
        <a href="${previewUrl}"
           style="display: inline-block; margin: 24px 0; padding: 14px 32px;
                  background: #3d2c1e; color: #ffffff; text-decoration: none;
                  font-size: 15px; letter-spacing: 0.05em; border-radius: 2px;">
          View Your Artwork Preview
        </a>
        <p style="color: #8a7968; font-size: 13px; line-height: 1.6;">
          Only printed once you've approved your artwork.
        </p>
        <p style="margin-top: 32px; color: #8a7968; font-size: 13px;">
          — The Place Portraits team
        </p>
      </div>
    `,
  });
}

export async function sendPreviewManualCheck({
  customerName,
  customerEmail,
}: {
  customerName: string;
  customerEmail: string;
}): Promise<SendResult> {
  return sendEmail({
    to: customerEmail,
    subject: "We're preparing your home artwork preview",
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1c1a17;">
        <h2 style="font-size: 22px; font-weight: normal; margin-bottom: 8px;">
          We're putting the finishing touches on your preview, ${customerName}
        </h2>
        <p style="color: #6b5e4e; line-height: 1.7;">
          Your personalised home artwork preview needs a quick manual check before
          we share it with you. We'll email you as soon as it's ready — usually
          within a few hours.
        </p>
        <p style="color: #6b5e4e; line-height: 1.7;">
          Thank you for your patience — we want to make sure your preview looks
          its best.
        </p>
        <p style="margin-top: 32px; color: #8a7968; font-size: 13px;">
          — The Place Portraits team
        </p>
      </div>
    `,
  });
}

export async function sendOrderConfirmation({
  customerName,
  customerEmail,
  productName,
  previewToken,
}: {
  customerName: string;
  customerEmail: string;
  productName: string;
  previewToken: string;
}): Promise<SendResult> {
  const previewUrl = `${siteUrl}/preview/${previewToken}`;
  return sendEmail({
    to: customerEmail,
    subject: "Your home artwork order is confirmed",
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1c1a17;">
        <h2 style="font-size: 22px; font-weight: normal; margin-bottom: 8px;">
          Your order is confirmed, ${customerName}
        </h2>
        <p style="color: #6b5e4e; line-height: 1.7;">
          Thank you for your order. We're preparing your <strong>${productName}</strong>
          for print and will email you with updates as we get closer to fulfilment.
        </p>
        <a href="${previewUrl}"
           style="display: inline-block; margin: 24px 0; padding: 14px 32px;
                  background: #3d2c1e; color: #ffffff; text-decoration: none;
                  font-size: 15px; letter-spacing: 0.05em; border-radius: 2px;">
          View Your Artwork
        </a>
        <p style="margin-top: 32px; color: #8a7968; font-size: 13px;">
          — The Place Portraits team
        </p>
      </div>
    `,
  });
}

export async function notifyAdminNewRequest({
  customerName,
  customerEmail,
  requestId,
}: {
  customerName: string;
  customerEmail: string;
  requestId: string;
}): Promise<SendResult> {
  if (!adminEmail) return { success: true };
  const adminUrl = `${siteUrl}/admin/requests/${requestId}`;
  return sendEmail({
    to: adminEmail,
    subject: `New preview request from ${customerName}`,
    html: `
      <p>New preview request received from <strong>${customerName}</strong> (${customerEmail}).</p>
      <p><a href="${adminUrl}">View in admin →</a></p>
    `,
  });
}
