"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownEditorProps {
  name: string;
  defaultValue?: string;
}

export function MarkdownEditor({ name, defaultValue = "" }: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2 border-b border-gray-200 pb-1">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={`px-3 py-1 text-sm rounded-t-md font-medium ${
            tab === "write"
              ? "bg-white border border-b-white border-gray-200 -mb-[1px] text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`px-3 py-1 text-sm rounded-t-md font-medium ${
            tab === "preview"
              ? "bg-white border border-b-white border-gray-200 -mb-[1px] text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Preview
        </button>
      </div>

      {tab === "write" ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={12}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          placeholder="Write your post in Markdown..."
        />
      ) : (
        <>
          <input type="hidden" name={name} value={value} />
          <div className="prose prose-sm max-w-none rounded-md border border-gray-200 bg-gray-50 px-4 py-3 min-h-[12rem]">
            {value ? (
              <ReactMarkdown>{value}</ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">Nothing to preview</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
