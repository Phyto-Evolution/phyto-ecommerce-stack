"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { auth } from "@/lib/auth";
import { events } from "@/lib/events/emitter";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createPost(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not authenticated");
  }

  const tenantId = getTenantId();
  const role = (session.user as { role?: string }).role;

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const slug = slugify(title);

  const isOwner = role === "OWNER";
  const status = isOwner ? "PUBLISHED" : "PENDING_REVIEW";
  const publishedAt = isOwner ? new Date() : null;

  const post = await db.post.create({
    data: {
      tenantId,
      authorId: session.user.id,
      title,
      slug,
      body,
      status,
      tags,
      publishedAt,
    },
  });

  if (status === "PUBLISHED") {
    await events.emit("post.published", {
      postId: post.id,
      tenantId,
      title,
      slug,
    });
  }

  revalidatePath("/blog");
  revalidatePath("/dashboard/blog");

  if (isOwner) {
    redirect("/dashboard/blog");
  } else {
    redirect("/blog");
  }
}

export async function approvePost(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not authenticated");
  }
  if ((session.user as { role?: string }).role !== "OWNER") {
    throw new Error("Not authorized — OWNER role required");
  }

  const tenantId = getTenantId();

  const post = await db.post.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await events.emit("post.published", {
    postId: post.id,
    tenantId,
    title: post.title,
    slug: post.slug,
  });

  revalidatePath("/blog");
  revalidatePath("/dashboard/blog");
}

export async function deletePost(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not authenticated");
  }
  if ((session.user as { role?: string }).role !== "OWNER") {
    throw new Error("Not authorized — OWNER role required");
  }

  const tenantId = getTenantId();

  await db.post.deleteMany({
    where: { id, tenantId },
  });

  revalidatePath("/blog");
  revalidatePath("/dashboard/blog");
}
