"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        {/* Optional: GitHub Profilbild anzeigen */}
        {session.user?.image && (
          <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-700" />
        )}
        <button
          onClick={() => signOut()}
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="px-4 py-2 text-sm font-medium text-white transition-all bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 shadow-lg"
    >
      Sign in with GitHub
    </button>
  );
}