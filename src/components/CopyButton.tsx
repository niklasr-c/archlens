"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 active:scale-95"
    >
      {copied ? (
        <>
          <Check size={16} className="text-green-400" />
          <span className="text-green-400">Copied as Markdown!</span>
        </>
      ) : (
        <>
          <Copy size={16} className="text-gray-400" />
          <span className="text-gray-300">Copy to Clipboard</span>
        </>
      )}
    </button>
  );
}