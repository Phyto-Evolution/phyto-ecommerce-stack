export function welcomeEmail({ storeName }: { storeName: string }): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #16a34a; font-size: 24px; margin-bottom: 16px;">
        Welcome to ${storeName}!
      </h1>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Thanks for subscribing! You'll receive notifications when we publish new content.
      </p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        — The ${storeName} Team
      </p>
    </div>
  `;
}
