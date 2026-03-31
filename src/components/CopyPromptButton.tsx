"use client";

import { useState } from "react";
import { Sparkles, Check } from "lucide-react";

export default function CopyPromptButton({ reportText }: { reportText: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Hier ist die Magie: Der neue TDD-fokussierte Prompt basierend auf dem User-Feedback!
    const promptMaster = `I just ran an architectural audit on my codebase and received the following DevSecOps report. 

    Please act as a Staff Software Engineer. Your goal is to fix these issues using a strict Test-Driven Development (TDD) approach:

    1. **Test-First Construction**: First, write strict automated tests that target the architectural flaws and tech debt mentioned. These tests MUST FAIL on the current codebase.
    2. **Refactoring**: Once the failing boundaries are set, refactor the code step-by-step until all tests pass.
    3. **Verification**: Ensure that the fix establishes hard boundaries so this tech debt can never be crossed again.

    Here is the report:

    ${reportText}`;

    try {
      await navigator.clipboard.writeText(promptMaster);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-indigo-600 border border-indigo-500 rounded-lg hover:bg-indigo-500 active:scale-95 shadow-lg shadow-indigo-500/20"
    >
      {copied ? (
        <>
          <Check size={16} className="text-white" />
          <span>Prompt Copied!</span>
        </>
      ) : (
        <>
          <Sparkles size={16} className="text-indigo-200" />
          <span>Fix with AI Agent</span>
        </>
      )}
    </button>
  );
}