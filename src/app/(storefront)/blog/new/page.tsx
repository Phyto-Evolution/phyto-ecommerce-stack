import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createPost } from "@/actions/blog-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/components/storefront/markdown-editor";

export default async function NewBlogPostPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session || (role !== "OWNER" && role !== "BUYER")) {
    redirect("/login");
  }

  const isBuyer = role === "BUYER";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Write a New Post
      </h1>

      {isBuyer && (
        <div className="mb-6 rounded-md bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
          Your post will be reviewed by the store owner before it is published.
        </div>
      )}

      <form action={createPost} className="space-y-5">
        <Input name="title" label="Title" placeholder="Post title" required />

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Body
          </label>
          <MarkdownEditor name="body" />
        </div>

        <Input
          name="tags"
          label="Tags"
          placeholder="Comma separated, e.g. news, updates"
        />

        <Button type="submit" size="md">
          {isBuyer ? "Submit for Review" : "Publish"}
        </Button>
      </form>
    </div>
  );
}
