"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { auth } from "@/lib/auth";

async function requireOwner() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not authenticated");
  }
  if ((session.user as { role?: string }).role !== "OWNER") {
    throw new Error("Not authorized — OWNER role required");
  }
  return session;
}

export async function getSettings(): Promise<Record<string, string>> {
  const tenantId = getTenantId();

  const rows = await db.storeSetting.findMany({
    where: { tenantId },
  });

  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = typeof row.value === "string" ? row.value : String(row.value);
  }
  return map;
}

export async function updateSettings(formData: FormData) {
  await requireOwner();
  const tenantId = getTenantId();

  const keys = [
    "storeName",
    "storeDescription",
    "contactEmail",
    "currency",
    "timezone",
  ] as const;

  for (const key of keys) {
    const value = formData.get(key) as string | null;
    if (value === null) continue;

    await db.storeSetting.upsert({
      where: { tenantId_key: { tenantId, key } },
      create: { tenantId, key, value },
      update: { value },
    });
  }

  revalidatePath("/dashboard/settings");
}
