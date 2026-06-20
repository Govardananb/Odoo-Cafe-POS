import React, { useState, useEffect } from "react";
import Logo from "./Logo";

export default function AuthFlow() {
  const [screen, setScreen] = useState("login"); // 'login' | 'signup' | 'session'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Default values for display
  const [employeeName, setEmployeeName] = useState("Govardanan B");
  const [greeting, setGreeting] = useState("Good afternoon");
  const [lastSessionDate, setLastSessionDate] = useState("Yesterday, 10:45 PM");
  const [previousSales, setPreviousSales] = useState("$1,245.50");
  const [terminalInfo, setTerminalInfo] = useState("Register #02 - Main Dining");

  // Determine dynamic greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
    
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(22, 45, 0);
    setLastSessionDate(yesterday.toLocaleDateString("en-US", options));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      if (!name) {
        const emailPrefix = email.split("@")[0];
        setEmployeeName(emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1));
      } else {
        setEmployeeName(name);
      }
      setScreen("session");
    }, 1200);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setEmployeeName(name);
      setScreen("session");
    }, 1200);
  };

  const triggerSuccessState = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`POS Terminal Session Authorized for ${employeeName} on Register #02. Accessing POS...`);
    }, 800);
  };

  return (
    <div className="flex flex-col p-8 md:p-10 animate-slide-in w-full">
      {/* Top Section: Logo */}
      <div className="pt-2 pb-6 flex justify-center">
        <Logo />
      </div>

      {/* Middle Section: Forms / Content */}
      <div className="flex-1 flex flex-col justify-center">
        
        {/* SCREEN 1: LOGIN */}
        {screen === "login" && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="text-center space-y-1 mb-6">
              <h2 className="font-sans text-xl font-semibold tracking-tight text-text-primary">
                Welcome Back
              </h2>
              <p className="text-xs font-sans text-text-secondary">
                Sign in to access the POS terminal
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-[14px] text-red-400 text-xs text-center font-medium font-sans">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full h-[52px] px-4 bg-[#111111] border border-[#232323] rounded-[14px] text-text-primary placeholder-[#7A7A7A] text-sm focus:outline-none focus:border-[#FF6B1A] transition-colors font-sans"
                  required
                />
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-[52px] px-4 bg-[#111111] border border-[#232323] rounded-[14px] text-text-primary placeholder-[#7A7A7A] text-sm focus:outline-none focus:border-[#FF6B1A] transition-colors font-sans"
                  required
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.99] disabled:opacity-50 text-black font-semibold rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer font-sans text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                "Open Session"
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setScreen("signup");
                }}
                className="text-xs text-text-secondary hover:text-text-primary transition-colors font-sans cursor-pointer"
              >
                Don't have an account? <span className="text-[#FF6B1A] hover:underline">Sign Up</span>
              </button>
            </div>
          </form>
        )}

        {/* SCREEN 2: SIGN UP */}
        {screen === "signup" && (
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="text-center space-y-1 mb-6">
              <h2 className="font-sans text-xl font-semibold tracking-tight text-text-primary">
                Create Account
              </h2>
              <p className="text-xs font-sans text-text-secondary">
                Set up employee credentials for the POS
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-[14px] text-red-400 text-xs text-center font-medium font-sans">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="relative">
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full h-[52px] px-4 bg-[#111111] border border-[#232323] rounded-[14px] text-text-primary placeholder-[#7A7A7A] text-sm focus:outline-none focus:border-[#FF6B1A] transition-colors font-sans"
                  required
                />
              </div>

              <div className="relative">
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full h-[52px] px-4 bg-[#111111] border border-[#232323] rounded-[14px] text-text-primary placeholder-[#7A7A7A] text-sm focus:outline-none focus:border-[#FF6B1A] transition-colors font-sans"
                  required
                />
              </div>

              <div className="relative">
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-[52px] px-4 bg-[#111111] border border-[#232323] rounded-[14px] text-text-primary placeholder-[#7A7A7A] text-sm focus:outline-none focus:border-[#FF6B1A] transition-colors font-sans"
                  required
                />
              </div>
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.99] disabled:opacity-50 text-black font-semibold rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer font-sans text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setScreen("login");
                }}
                className="text-xs text-text-secondary hover:text-text-primary transition-colors font-sans cursor-pointer"
              >
                Already have an account? <span className="text-[#FF6B1A] hover:underline">Login</span>
              </button>
            </div>
          </form>
        )}

        {/* SCREEN 3: OPEN SESSION */}
        {screen === "session" && (
          <div className="space-y-5 text-center animate-slide-in">
            <div className="space-y-1 mb-5">
              <span className="text-[10px] tracking-[0.2em] text-[#FF6B1A] uppercase font-semibold">
                Authorization Granted
              </span>
              <h2 className="font-sans text-xl font-semibold tracking-tight text-text-primary">
                {greeting},
              </h2>
              <div className="font-sans text-lg font-medium text-text-secondary mt-0.5">
                {employeeName}
              </div>
            </div>

            {/* Operational Metadata */}
            <div className="border border-[#232323] rounded-[14px] p-4 space-y-3.5 text-left bg-transparent">
              <div className="flex justify-between items-center border-b border-[#232323] pb-2.5">
                <span className="text-xs text-text-secondary font-sans">Last Session</span>
                <span className="text-xs text-text-primary font-medium font-sans">{lastSessionDate}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#232323] pb-2.5">
                <span className="text-xs text-text-secondary font-sans">Prev. Sales</span>
                <span className="text-xs text-[#FF6B1A] font-semibold font-sans">{previousSales}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary font-sans">Terminal Info</span>
                <span className="text-xs text-text-primary font-medium font-sans">{terminalInfo}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                id="open-pos"
                onClick={triggerSuccessState}
                disabled={loading}
                className="w-full h-[52px] bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.99] disabled:opacity-50 text-black font-semibold rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer font-sans text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Open POS"
                )}
              </button>

              <button
                id="switch-employee"
                onClick={() => {
                  setName("");
                  setEmail("");
                  setPassword("");
                  setScreen("login");
                }}
                className="w-full h-[52px] bg-transparent border border-[#232323] hover:bg-[#111111]/50 active:scale-[0.99] text-text-primary font-medium rounded-[14px] transition-all cursor-pointer font-sans text-sm"
              >
                Switch Employee
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: Footer / Branding */}
      <div className="pt-8 text-center">
        <p className="text-[9px] tracking-wider text-text-secondary/40 font-sans select-none">
          ODOO CAFE POS Terminal v14.0.2 • Secure Session
        </p>
      </div>
    </div>
  );
}
