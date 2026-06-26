import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  apiCreateUrl,
  apiDeleteUrl,
  apiGetAnalytics,
  apiGetUrls,
  apiUpdateUrl,
  apiGetQrCodeUrl,
  apiGetMe,
  apiUpdateMe,
  shortLink,
} from "../src/lib/api";
import { useToast } from "../src/components/Toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const PAGE_SIZE = 10;

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Copy: (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Trash: (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Edit: (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Chart: (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Search: (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Link: (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Close: (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ChevronLeft: (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronRight: (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Plus: (p) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  External: (p) => <svg {...p} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  QrCode: (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  User: (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Settings: (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  LogOut: (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Grid: (p) => <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
};

// ── Shared UI ─────────────────────────────────────────────────────────────────
function IconBtn({ children, onClick, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
        danger 
          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" 
          : "bg-white/5 text-white/50 hover:bg-white/20 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────────
function ModalBackdrop({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="mx-4 w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0a0a0f] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function QrModal({ url, onClose }) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let objectUrl = null;
    apiGetQrCodeUrl(url.short_code)
      .then(url => {
        objectUrl = url;
        setSrc(url);
      })
      .catch(() => toast.error("Could not load QR code."))
      .finally(() => setLoading(false));
      
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url.short_code]);

  return (
    <ModalBackdrop onClose={onClose}>
      <h2 className="mb-2 text-2xl font-bold text-white tracking-tight">QR Code</h2>
      <p className="mb-6 text-sm text-white/50 font-mono">/{url.short_code}</p>
      
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-white p-6 shadow-inner">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-gray-200" />
        ) : src ? (
          <img src={src} alt="QR Code" className="h-full w-full object-contain" />
        ) : (
          <p className="text-black">Failed to load</p>
        )}
      </div>
      
      <button onClick={onClose} className="mt-8 w-full rounded-2xl bg-white/10 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 hover:shadow-lg">
        Done
      </button>
    </ModalBackdrop>
  );
}

function EditModal({ url, onClose, onSaved, toast }) {
  const [value, setValue] = useState(url.original_url);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await apiUpdateUrl(url.short_code, value);
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.detail || "Failed to update URL.");
        return;
      }
      onSaved(await res.json());
      toast.success("URL updated!");
      onClose();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <h2 className="mb-2 text-2xl font-bold text-white tracking-tight">Edit Destination</h2>
      <p className="mb-6 text-sm text-white/50 font-mono">/{url.short_code}</p>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-4 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-inner"
      />
      <div className="mt-8 flex gap-3">
        <button onClick={onClose} className="flex-1 rounded-2xl bg-white/5 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={loading} className="flex-1 rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors shadow-lg hover:shadow-violet-600/30">
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </ModalBackdrop>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "overview", label: "Overview", icon: Icon.Grid },
    { id: "links", label: "My Links", icon: Icon.Link },
    { id: "analytics", label: "Analytics", icon: Icon.Chart },
    { id: "profile", label: "Settings", icon: Icon.Settings },
  ];

  return (
    <div className="w-64 shrink-0 border-r border-white/5 bg-[#050508] p-6 hidden md:flex flex-col">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/20">
          <Icon.Link className="text-white h-4 w-4" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">SnapURL</span>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2 px-3">Menu</div>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                active
                  ? "bg-violet-500/10 text-violet-400"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon className={active ? "text-violet-400" : "text-white/40"} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <button
          onClick={() => {
            localStorage.removeItem("snapurl_token");
            window.dispatchEvent(new Event("snapurl:logout"));
          }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all"
        >
          <Icon.LogOut />
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ onAddClick, user }) {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-white/5 bg-[#050508]/80 px-8 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-4">
        {/* Mobile menu could go here */}
        <h1 className="text-xl font-semibold text-white tracking-tight hidden sm:block">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <button
          onClick={onAddClick}
          className="group flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:bg-violet-500 hover:shadow-violet-500/40"
        >
          <Icon.Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
          Create Link
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
            <Icon.User className="text-white/50" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-white">{user?.name || "User"}</div>
            <div className="text-xs text-white/40">{user?.email || "loading..."}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Create Modal ──────────────────────────────────────────────────────────────
function CreateModal({ onClose, onCreated, toast }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await apiCreateUrl(url.trim());
      if (!res.ok) throw new Error((await res.json()).detail);
      toast.success("Short link created!");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || "Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <h2 className="mb-2 text-2xl font-bold text-white tracking-tight">Create New Link</h2>
      <p className="mb-6 text-sm text-white/50">Enter your long destination URL below.</p>
      
      <form onSubmit={handleCreate}>
        <div className="relative mb-8">
          <Icon.Link className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very/long/path"
            className="w-full rounded-2xl border border-white/10 bg-black/50 py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-inner"
          />
        </div>
        
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl bg-white/5 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors">Cancel</button>
          <button type="submit" disabled={loading || !url.trim()} className="flex-1 flex justify-center items-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors shadow-lg hover:shadow-violet-600/30">
            <Icon.Plus /> {loading ? "Creating…" : "Shorten URL"}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

// ── Tab: Overview ─────────────────────────────────────────────────────────────
function OverviewTab({ stats }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back!</h2>
        <p className="text-white/50 mt-1">Here's what's happening with your links today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0f] p-8 shadow-xl">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4 mb-4 text-violet-400">
            <div className="p-3 bg-violet-500/10 rounded-xl"><Icon.Link /></div>
            <h3 className="font-semibold text-white/70">Total Links</h3>
          </div>
          <p className="text-5xl font-black tracking-tighter text-white">{stats.totalLinks}</p>
        </div>
        
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0f] p-8 shadow-xl">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4 mb-4 text-blue-400">
            <div className="p-3 bg-blue-500/10 rounded-xl"><Icon.Chart /></div>
            <h3 className="font-semibold text-white/70">Total Clicks</h3>
          </div>
          <p className="text-5xl font-black tracking-tighter text-white">{stats.totalClicks}</p>
        </div>
        
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0f] p-8 shadow-xl">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4 mb-4 text-emerald-400">
            <div className="p-3 bg-emerald-500/10 rounded-xl"><Icon.Chart /></div>
            <h3 className="font-semibold text-white/70">Avg. Clicks/Link</h3>
          </div>
          <p className="text-5xl font-black tracking-tighter text-white">
            {stats.totalLinks > 0 ? (stats.totalClicks / stats.totalLinks).toFixed(1) : 0}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Links (Data Table) ───────────────────────────────────────────────────
function LinksTab({ urls, loading, page, setPage, search, setSearch, sortBy, setSortOrder, fetchUrls, setAnalyticsUrl, setEditUrl, setQrUrl, toast }) {
  
  async function deleteUrl(url) {
    if (!window.confirm(`Delete ${shortLink(url.short_code)}?`)) return;
    try {
      const res = await apiDeleteUrl(url.short_code);
      if (!res.ok) throw new Error();
      toast.success("Link deleted.");
      fetchUrls();
    } catch {
      toast.error("Failed to delete.");
    }
  }

  function copyLink(code) {
    navigator.clipboard.writeText(shortLink(code)).then(() => toast.success("Copied to clipboard!"));
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">My Links</h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Icon.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search destination or code..."
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] py-2.5 pl-11 pr-4 text-sm text-white outline-none focus:border-violet-500 focus:bg-white/5 transition-all shadow-inner"
            />
          </div>
          <select 
            onChange={(e) => {
              const [b, o] = e.target.value.split("-");
              setSortBy(b); setSortOrder(o); setPage(0);
            }}
            className="rounded-xl border border-white/10 bg-[#0a0a0f] py-2.5 px-4 text-sm text-white outline-none focus:border-violet-500 transition-all cursor-pointer"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="clicks-desc">Most Clicks</option>
            <option value="clicks-asc">Least Clicks</option>
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-[#0a0a0f] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white">
            <thead className="border-b border-white/5 bg-white/[0.02] text-xs uppercase text-white/40">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Short Link</th>
                <th className="px-6 py-4 font-semibold tracking-wider hidden md:table-cell">Destination</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Clicks</th>
                <th className="px-6 py-4 font-semibold tracking-wider hidden sm:table-cell">Created</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(PAGE_SIZE)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-5 w-24 bg-white/5 rounded-md" /></td>
                    <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 w-48 bg-white/5 rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-white/5 rounded-md ml-auto" /></td>
                    <td className="px-6 py-4 hidden sm:table-cell"><div className="h-4 w-20 bg-white/5 rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-32 bg-white/5 rounded-md ml-auto" /></td>
                  </tr>
                ))
              ) : urls.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-white/40">No links found matching your criteria.</td>
                </tr>
              ) : (
                urls.map(u => (
                  <tr key={u.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-violet-400">{u.short_code}</span>
                        <button onClick={() => copyLink(u.short_code)} className="text-white/20 hover:text-white transition-colors" title="Copy">
                          <Icon.Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell max-w-xs">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-white/60">{u.original_url}</p>
                        <a href={shortLink(u.short_code)} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white shrink-0">
                          <Icon.External className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/80">
                        {u.clicks}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/40 hidden sm:table-cell whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 transition-opacity sm:group-hover:opacity-100">
                        <IconBtn onClick={() => setQrUrl(u)} title="QR Code"><Icon.QrCode /></IconBtn>
                        <IconBtn onClick={() => setAnalyticsUrl(u)} title="Analytics"><Icon.Chart /></IconBtn>
                        <IconBtn onClick={() => setEditUrl(u)} title="Edit"><Icon.Edit /></IconBtn>
                        <IconBtn onClick={() => deleteUrl(u)} title="Delete" danger><Icon.Trash /></IconBtn>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-white/5 bg-white/[0.01] px-6 py-4">
          <div className="text-xs text-white/40">
            Showing page {page + 1}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#0a0a0f] text-white hover:bg-white/5 disabled:opacity-30 transition-all shadow-sm">
              <Icon.ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={urls.length < PAGE_SIZE} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#0a0a0f] text-white hover:bg-white/5 disabled:opacity-30 transition-all shadow-sm">
              <Icon.ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Analytics ────────────────────────────────────────────────────────────
function AnalyticsTab({ url, onBack }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    apiGetAnalytics(url.short_code)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const logs = await res.json();
        
        // Group by day for simple bar chart
        const byDay = {};
        logs.forEach(l => {
          const d = new Date(l.clicked_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          byDay[d] = (byDay[d] || 0) + 1;
        });
        
        const chartData = Object.entries(byDay)
          .map(([date, clicks]) => ({ date, clicks }))
          .slice(-14); // last 14 active days
          
        setData(chartData);
      })
      .catch(() => toast.error("Could not load analytics."))
      .finally(() => setLoading(false));
  }, [url]);

  if (!url) return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 rounded-2xl bg-white/5 p-4 text-white/30"><Icon.Chart className="h-8 w-8" /></div>
      <h3 className="text-xl font-semibold text-white">No Link Selected</h3>
      <p className="mt-2 text-white/50 max-w-sm">Select a link from the 'My Links' tab and click the analytics icon to view its performance.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white">
          <Icon.ChevronLeft />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Analytics</h2>
          <p className="text-white/50 text-sm font-mono mt-0.5">/{url.short_code}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-[#0a0a0f] p-8 shadow-2xl">
        <h3 className="mb-8 text-lg font-semibold text-white flex items-center gap-3">
          <Icon.Chart className="text-violet-400" />
          Click Activity (Last 14 Active Days)
        </h3>
        
        <div className="h-80 w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-white/30">
              <Icon.Chart className="mb-2 h-8 w-8 opacity-50" />
              <p>No click data recorded yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{fill: "rgba(255,255,255,0.5)", fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: "rgba(255,255,255,0.5)", fontSize: 12}} axisLine={false} tickLine={false} dx={-10} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: "rgba(255,255,255,0.02)"}}
                  contentStyle={{ backgroundColor: "#1a1a24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }} 
                  itemStyle={{ color: "#a78bfa" }} 
                />
                <Bar dataKey="clicks" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Settings ─────────────────────────────────────────────────────────────
function SettingsTab({ user, fetchUser }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiUpdateMe({ name, email });
      if (!res.ok) throw new Error((await res.json()).detail);
      toast.success("Profile updated successfully");
      fetchUser();
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Account Settings</h2>
        <p className="text-white/50 mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="rounded-3xl border border-white/5 bg-[#0a0a0f] p-8 shadow-2xl">
        <div className="flex items-center gap-6 mb-10 pb-10 border-b border-white/5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-xl shadow-violet-500/20 border border-white/10">
            <Icon.User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{user?.name}</h3>
            <p className="text-white/50">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Display Name</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-inner"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-inner"
            />
          </div>
          
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50"
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview"); // overview, links, analytics, profile
  const [user, setUser] = useState(null);
  
  // Data Fetching State
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal State
  const [creating, setCreating] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [editUrl, setEditUrl] = useState(null);
  const [analyticsUrl, setAnalyticsUrl] = useState(null);
  const toast = useToast();

  const fetchUser = async () => {
    try {
      const res = await apiGetMe();
      if (res.ok) setUser(await res.json());
    } catch {}
  };

  const fetchUrls = async () => {
    setLoading(true);
    try {
      const res = await apiGetUrls({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, query: search, sortBy, sortOrder });
      if (res.ok) setUrls(await res.json());
    } catch (e) {
      toast.error("Failed to load links.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUser();
  }, []);

  // Debounced fetch for links table
  useEffect(() => {
    const timer = setTimeout(fetchUrls, 300);
    return () => clearTimeout(timer);
  }, [search, sortBy, sortOrder, page]);

  // Derived stats for Overview
  const stats = useMemo(() => {
    const totalLinks = urls.length; // Approximate for MVP if not fully paginated via distinct count endpoint
    const totalClicks = urls.reduce((acc, u) => acc + u.clicks, 0);
    return { totalLinks, totalClicks };
  }, [urls]);

  // Route to analytics tab when analytics icon clicked
  useEffect(() => {
    if (analyticsUrl) setActiveTab("analytics");
  }, [analyticsUrl]);

  return (
    <div className="flex h-screen bg-[#030303] text-white font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/10 via-[#030303] to-[#030303]">
        <Header onAddClick={() => setCreating(true)} user={user} />
        
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 scroll-smooth">
          <div className="mx-auto max-w-6xl">
            {activeTab === "overview" && <OverviewTab stats={stats} />}
            {activeTab === "links" && (
              <LinksTab 
                urls={urls} loading={loading} page={page} setPage={setPage}
                search={search} setSearch={setSearch} sortBy={sortBy} setSortOrder={setSortOrder}
                fetchUrls={fetchUrls} setAnalyticsUrl={setAnalyticsUrl} setEditUrl={setEditUrl} 
                setQrUrl={setQrUrl} toast={toast}
              />
            )}
            {activeTab === "analytics" && <AnalyticsTab url={analyticsUrl} onBack={() => setActiveTab("links")} />}
            {activeTab === "profile" && <SettingsTab user={user} fetchUser={fetchUser} />}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {creating && <CreateModal onClose={() => setCreating(false)} onCreated={fetchUrls} toast={toast} />}
        {qrUrl && <QrModal url={qrUrl} onClose={() => setQrUrl(null)} />}
        {editUrl && <EditModal url={editUrl} onClose={() => setEditUrl(null)} onSaved={fetchUrls} toast={toast} />}
      </AnimatePresence>
    </div>
  );
}
