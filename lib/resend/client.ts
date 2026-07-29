import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNewReviewAlert(params: {
  to: string;
  businessName: string;
  authorName: string;
  rating: number;
  reviewText: string | null;
  dashboardUrl: string;
}) {
  const { to, businessName, authorName, rating, reviewText, dashboardUrl } = params;
  const isLowRating = rating <= 3;

  await resend.emails.send({
    from: "ReputationPilot <alerts@notifications.reputationpilot.app>",
    to,
    subject: isLowRating
      ? `New ${rating}-star review needs your attention — ${businessName}`
      : `New ${rating}-star review for ${businessName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <p>Hi,</p>
        <p><strong>${authorName}</strong> just left a ${rating}-star review${
      reviewText ? ":" : " (no written comment)."
    }</p>
        ${
          reviewText
            ? `<p style="background:#f5f5f3; padding:12px 16px; border-radius:6px; color:#333;">${reviewText}</p>`
            : ""
        }
        <p><a href="${dashboardUrl}" style="background:#0F6E56; color:white; padding:10px 18px; border-radius:6px; text-decoration:none; display:inline-block;">Draft a reply</a></p>
        <p style="color:#888; font-size:13px;">You're receiving this because you connected ${businessName} to ReputationPilot.</p>
      </div>
    `,
  });
}
