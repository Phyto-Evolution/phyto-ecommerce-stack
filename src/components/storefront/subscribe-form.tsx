"use client";

import { useState } from "react";
import { subscribe } from "@/actions/subscriber-actions";
import { Button } from "@/components/ui/button";

export function SubscribeForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    const result = await subscribe(formData);
    if (result.error) {
      setStatus("error");
      setMessage(result.error);
    } else {
      setStatus("success");
      setMessage("You're subscribed! Check your email for a welcome message.");
    }
  }

  return (
    <div className="rounded-lg bg-green-50 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Subscribe to our blog
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Get notified when we publish new posts.
      </p>
      {status === "success" ? (
        <p className="text-sm font-medium text-green-700">{message}</p>
      ) : (
        <form action={handleSubmit} className="flex gap-2">
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <Button type="submit">Subscribe</Button>
          {status === "error" && (
            <p className="text-sm text-red-600 self-center">{message}</p>
          )}
        </form>
      )}
    </div>
  );
}
