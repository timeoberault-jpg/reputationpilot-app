import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export async function sendRatingAlert(params: {
  to: string;
  businessName: string;
  newReviews: number;
  rating: number | null;
  ratingChange: number;
  dashboardUrl: string;
}) {
  const { to, businessName, newReviews, rating, ratingChange, dashboardUrl } =
    params;
  const isBadNews = ratingChange < 0;

  await resend.emails.send({
    from: "ReputationPilot <alerts@notifications.reputationpilot.app>",
    to,
    subject: isBadNews
      ? `Your rating dropped — ${businessName}`
      : `${newReviews} new review${newReviews > 1 ? "s" : ""} — ${businessName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <p>Hi,</p>
        <p><strong>${businessName}</strong> just received
        ${newReviews} new review${newReviews > 1 ? "s" : ""} on Google.</p>
        <p style="background:#f5f5f3; padding:12px 16px; border-radius:6px;">
          Rating now: <strong>${rating ?? "—"} / 5</strong>
          ${
            ratingChange !== 0
              ? ` (${ratingChange > 0 ? "+" : ""}${ratingChange})`
              : ""
          }
        </p>
        ${
          isBadNews
            ? `<p>Your rating went down, so the new review is likely negative.
               Replying quickly makes a real difference.</p>`
            : ""
        }
        <p><a href="${dashboardUrl}" style="background:#0F6E56; color:white; padding:10px 18px; border-radius:6px; text-decoration:none; display:inline-block;">Open dashboard</a></p>
        <p style="color:#888; font-size:13px;">You're receiving this because you
        connected ${businessName} to ReputationPilot.</p>
      </div>
    `,
  });
}
