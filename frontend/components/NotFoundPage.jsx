export default function NotFoundPage({ onNavigate }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#08080f] text-center text-white px-4">
      <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 mb-8 shadow-xl">
        <div className="absolute inset-0 rounded-2xl border border-white/10" />
        <span className="text-5xl font-bold text-violet-500">404</span>
      </div>
      
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
        Page not found
      </h1>
      
      <p className="mb-10 max-w-md text-lg text-white/50">
        Oops! The link you clicked may be broken or the page may have been removed.
      </p>
      
      <button
        onClick={() => onNavigate("landing")}
        className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-violet-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
      >
        Back to Home
      </button>
    </div>
  );
}
