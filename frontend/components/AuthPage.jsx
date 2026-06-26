import { useState } from "react";
import { apiLogin, apiSignup, storeTokens } from "../src/lib/api";

function AuthPage({ mode, onNavigate, onAuthSuccess }) {
  const isSignup = mode === "signup";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const name = form.get("name");
    const email = form.get("email");
    const password = form.get("password");

    try {
      if (isSignup) {
        const signupRes = await apiSignup({ name, email, password });
        if (!signupRes.ok) {
          const err = await signupRes.json();
          setError(err.detail || "Signup failed. Please try again.");
          return;
        }
      }

      const loginRes = await apiLogin({ email, password });
      if (!loginRes.ok) {
        const err = await loginRes.json();
        setError(err.detail || "Login failed. Check your credentials.");
        return;
      }

      const data = await loginRes.json();
      storeTokens(data);
      onAuthSuccess();
    } catch (e) {
      setError(e.message || "Could not connect to the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <button onClick={() => onNavigate("landing")} className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 shadow-lg shadow-violet-500/30">
            <div className="absolute h-3.5 w-5 -rotate-45 rounded-full border-2 border-white" />
            <div className="absolute h-3.5 w-5 rotate-45 rounded-full border-2 border-white/80" />
            <div className="absolute h-2 w-2 rounded-full bg-white" />
          </div>
          <span className="text-base font-bold">SnapURL</span>
        </button>

        <button
          onClick={() => onNavigate(isSignup ? "login" : "signup")}
          className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
        >
          {isSignup ? "Login" : "Sign up"}
        </button>
      </div>

      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center py-10">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur-xl sm:p-8 relative overflow-hidden">
          {/* Subtle gradient blob for vibe */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-[80px]"></div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400 relative z-10">
            {isSignup ? "Create account" : "Welcome back"}
          </p>

          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.05em] relative z-10">
            {isSignup ? "Start shortening smarter links." : "Login to your dashboard."}
          </h1>

          <p className="mt-4 text-sm leading-6 text-gray-300 relative z-10">
            {isSignup
              ? "Create your free SnapURL account and manage your short links from one simple place."
              : "Access your links, create new short URLs, and track basic clicks."}
          </p>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 relative z-10">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 relative z-10">
            {isSignup && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">Name</label>
                <input
                  name="name"
                  required
                  placeholder="John Doe"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-500 hover:bg-white/10 focus:border-violet-500 focus:bg-white/10"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-500 hover:bg-white/10 focus:border-violet-500 focus:bg-white/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-500 hover:bg-white/10 focus:border-violet-500 focus:bg-white/10"
              />
            </div>

            <button
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] hover:shadow-violet-500/40 disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? "Please wait…" : isSignup ? "Create free account" : "Login"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;

