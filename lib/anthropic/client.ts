import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function draftReviewReply(params: {
  businessName: string;
  authorName: string;
  rating: number;
  reviewText: string | null;
}): Promise<string> {
  const { businessName, authorName, rating, reviewText } = params;

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 300,
    system: `You write short, professional replies to customer reviews on
behalf of "${businessName}". Rules:
- Address the reviewer by first name only.
- Thank them, sincerely and briefly.
- If the review is negative (3 stars or below), acknowledge the specific
  issue mentioned, apologize without being defensive, and invite them to
  reach out privately to resolve it.
- If the review is positive, keep it warm and brief, no invented details.
- Never invent facts about what happened during their visit.
- 2-4 sentences maximum. No sign-off, no business name at the end.
- Output only the reply text, nothing else.`,
    messages: [
      {
        role: "user",
        content: `Reviewer: ${authorName}
Rating: ${rating}/5
Review text: ${reviewText ?? "(no text, rating only)"}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text.trim() : "";
}
