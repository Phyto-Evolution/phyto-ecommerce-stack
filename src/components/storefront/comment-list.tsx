interface Comment {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string } | null;
}

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <p className="text-gray-500 italic">
        No comments yet. Be the first!
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li key={comment.id} className="border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <span className="font-medium text-gray-900">
              {comment.author?.name ?? "Anonymous"}
            </span>
            <span>&middot;</span>
            <time dateTime={comment.createdAt.toISOString()}>
              {comment.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap">{comment.body}</p>
        </li>
      ))}
    </ul>
  );
}
