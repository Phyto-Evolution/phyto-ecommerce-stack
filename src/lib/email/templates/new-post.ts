export function newPostEmail({
  storeName,
  postTitle,
  postUrl,
}: {
  storeName: string;
  postTitle: string;
  postUrl: string;
}): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #16a34a; font-size: 24px; margin-bottom: 16px;">
        New Post from ${storeName}
      </h1>
      <h2 style="color: #111827; font-size: 20px; margin-bottom: 12px;">
        ${postTitle}
      </h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        We just published a new post. Check it out!
      </p>
      <a href="${postUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Read Post
      </a>
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        — The ${storeName} Team
      </p>
    </div>
  `;
}
