"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function addComment(postId: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Must be signed in to comment");

  const body = formData.get("body") as string;
  if (!body.trim()) throw new Error("Comment cannot be empty");

  await db.comment.create({
    data: { postId, authorId: session.user.id, body: body.trim() },
  });

  const post = await db.post.findUnique({ where: { id: postId } });
  if (post) revalidatePath(`/blog/${post.slug}`);
}
