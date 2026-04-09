import { events } from "./emitter";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { newPostEmail } from "@/lib/email/templates/new-post";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

events.on("post.published", async ({ tenantId, title, slug }) => {
  const subscribers = await db.subscriber.findMany({
    where: { tenantId, confirmed: true },
    select: { email: true },
  });
  if (subscribers.length === 0) return;
  const html = newPostEmail({
    storeName: "PhytoCommerce",
    postTitle: title,
    postUrl: `${APP_URL}/blog/${slug}`,
  });
  await sendEmail({
    to: subscribers.map((s) => s.email),
    subject: `New Post: ${title}`,
    html,
  });
});

export function initEventHandlers() {}
