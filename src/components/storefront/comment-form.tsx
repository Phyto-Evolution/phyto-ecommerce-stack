"use client";

import { useRef } from "react";
import { addComment } from "@/actions/comment-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({ postId }: { postId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await addComment(postId, formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <Textarea
        name="body"
        placeholder="Write a comment..."
        rows={3}
        required
      />
      <Button type="submit" size="sm">
        Post Comment
      </Button>
    </form>
  );
}
