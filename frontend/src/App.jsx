import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Pricing from "../components/Pricing";
import Roadmap from "../components/Roadmap";
import CallToAction from "../components/CallToAction";
import Footer from "../components/Footer";
import AuthPage from "../components/AuthPage";
import Dashboard from "../components/Dashboard";
import NotFoundPage from "../components/NotFoundPage";
import { ToastProvider } from "./components/Toast";

function App() {
  const [page, setPage] = useState(() => {
    if (window.location.pathname !== "/" && window.location.pathname !== "") {
      return "404";
    }
    return localStorage.getItem("snapurl_token") ? "dashboard" : "landing";
  });

  // Listen for auto-logout triggered by token expiry
  useEffect(() => {
    const handleLogout = () => setPage("login");
    window.addEventListener("snapurl:logout", handleLogout);
    return () => window.removeEventListener("snapurl:logout", handleLogout);
  }, []);

  // Sync URL to hide path if we navigate away from 404
  useEffect(() => {
    if (page !== "404" && window.location.pathname !== "/") {
      window.history.replaceState({}, "", "/");
    }
  }, [page]);

  if (page === "signup") {
    return (
      <>
        <ToastProvider />
        <AuthPage
          mode="signup"
          onNavigate={setPage}
          onAuthSuccess={() => setPage("dashboard")}
        />
      </>
    );
  }

  if (page === "login") {
    return (
      <>
        <ToastProvider />
        <AuthPage
          mode="login"
          onNavigate={setPage}
          onAuthSuccess={() => setPage("dashboard")}
        />
      </>
    );
  }

  if (page === "404") {
    return <NotFoundPage onNavigate={setPage} />;
  }

  if (page === "dashboard") {
    return (
      <>
        <ToastProvider />
        <Dashboard onNavigate={setPage} />
      </>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <ToastProvider />
      <div className="relative">
        <Navbar onNavigate={setPage} />
        <Hero onNavigate={setPage} />
      </div>

      <Features />
      <Pricing onNavigate={setPage} />
      <Roadmap />
      <CallToAction onNavigate={setPage} />
      <Footer onNavigate={setPage} />
    </main>
  );
}

export default App;

