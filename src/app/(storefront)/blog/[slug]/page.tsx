import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CommentList } from "@/components/storefront/comment-list";
import { CommentForm } from "@/components/storefront/comment-form";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenantId = getTenantId();

  const post = await db.post.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
    include: {
      comments: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  // Fetch comment authors
  const authorIds = [...new Set(post.comments.map((c) => c.authorId))];
  const authors =
    authorIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: authorIds } },
          select: { id: true, name: true },
        })
      : [];
  const authorMap = new Map(authors.map((a) => [a.id, a]));

  const commentsWithAuthors = post.comments.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt,
    author: authorMap.get(c.authorId) ?? null,
  }));

  // Fetch post author name
  const postAuthor = await db.user.findUnique({
    where: { id: post.authorId },
    select: { name: true },
  });

  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <article>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          {postAuthor?.name && <span>By {postAuthor.name}</span>}
          {post.publishedAt && (
            <>
              <span>&middot;</span>
              <time dateTime={post.publishedAt.toISOString()}>
                {post.publishedAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </>
          )}
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-green max-w-none">
          <ReactMarkdown>{post.body}</ReactMarkdown>
        </div>
      </article>

      <hr className="my-10 border-gray-200" />

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments</h2>
        <CommentList comments={commentsWithAuthors} />
        {session && (
          <div className="mt-6">
            <CommentForm postId={post.id} />
          </div>
        )}
      </section>
    </div>
  );
}
