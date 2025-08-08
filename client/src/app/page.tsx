"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE}/auth/google`;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Katalyst MCP</h1>
        <p className="text-gray-400 mb-8">
          Connect your Google Calendar to see upcoming & past meetings, and get
          AI-powered contextual insights — all in one place.
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-white text-gray-900 rounded-lg font-medium shadow-lg hover:bg-gray-100 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></span>
              Connecting...
            </>
          ) : (
            <>
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google Logo"
                className="w-5 h-5"
              />
              Sign in with Google
            </>
          )}
        </button>

        <p className="mt-6 text-sm text-gray-500">
          By signing in, you agree to allow Katalyst MCP to read your calendar
          events and provide contextual meeting insights.
        </p>
      </div>
    </main>
  );
}
