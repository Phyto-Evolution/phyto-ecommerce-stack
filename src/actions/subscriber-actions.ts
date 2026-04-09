"use server";

import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates/welcome";

export async function subscribe(formData: FormData) {
  const tenantId = getTenantId();
  const email = (formData.get("email") as string).toLowerCase().trim();
  if (!email || !email.includes("@")) return { error: "Invalid email address" };

  const existing = await db.subscriber.findUnique({
    where: { tenantId_email: { tenantId, email } },
  });
  if (existing) return { error: "Already subscribed" };

  await db.subscriber.create({ data: { tenantId, email, confirmed: true } });
  await sendEmail({
    to: email,
    subject: "Welcome!",
    html: welcomeEmail({ storeName: "PhytoCommerce" }),
  });
  return { success: true };
}
