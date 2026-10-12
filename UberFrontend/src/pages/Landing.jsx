import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "PASSENGER") navigate("/passenger/dashboard");
    else if (user?.role === "DRIVER") navigate("/driver/dashboard");
  }, [user]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-hidden">

      {/* ── Navbar ── */}
      <header className="flex items-center justify-between px-8 py-5 z-10 relative">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🌊</span>
          <span className="text-2xl font-extrabold tracking-tight text-white">Flowride</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/passenger/login")}
            className="text-sm font-semibold text-gray-300 hover:text-white transition px-4 py-2"
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/passenger/signup")}
            className="bg-white text-black text-sm font-bold px-5 py-2 rounded-full hover:bg-gray-200 transition"
          >
            Sign up
          </button>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main className="flex-1 relative">

        {/* Glowing blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-600/20 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-700/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 max-w-7xl mx-auto px-8 py-20">

          {/* ── Left: Text ── */}
          <div className="flex-1 space-y-8">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-300 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Real-time ride matching — Now live
            </div>

            <h1 className="text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight">
              Your ride,{" "}
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                your flow
              </span>
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
              Book a ride in seconds, track your driver live on the map, and flow through the city — effortlessly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/passenger/login")}
                className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-lg shadow-violet-700/40 hover:shadow-violet-700/60 transition-all hover:scale-105"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>🧍</span> Ride with Flowride
                </span>
              </button>
              <button
                onClick={() => navigate("/driver/login")}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-white/20 transition-all hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>🛞</span> Drive with us
                </span>
              </button>
            </div>

            {/* Trust stats */}
            <div className="flex gap-8 pt-4">
              {[
                { value: "10K+", label: "Active Riders" },
                { value: "500+", label: "Drivers" },
                { value: "4.9★", label: "Avg. Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Feature Cards ── */}
          <div className="flex-1 flex flex-col items-center gap-5">

            {/* Hero visual — abstract journey */}
            <div className="w-full max-w-md bg-gradient-to-br from-violet-900/60 to-cyan-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🌊</div>
                  <div>
                    <p className="font-bold text-sm">Flowride</p>
                    <p className="text-xs text-gray-400">Finding your ride...</p>
                  </div>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold animate-pulse">
                  ● LIVE
                </span>
              </div>

              {/* Map placeholder visualization */}
              <div className="relative bg-gray-900/70 rounded-2xl overflow-hidden h-44 flex items-center justify-center mb-5 border border-white/5">
                {/* Grid lines simulating map */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-10">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="border border-gray-400" />
                  ))}
                </div>
                {/* Route dots */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/30 animate-pulse" />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-violet-400 ring-4 ring-violet-400/30 animate-pulse" />
                {/* Dashed route line */}
                <div className="absolute left-[14%] right-[14%] top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 opacity-70" style={{backgroundSize: '8px 2px', backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0, currentColor 4px, transparent 4px, transparent 8px)'}} />
                {/* Moving driver indicator */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-lg backdrop-blur-sm">
                  🛵
                </div>
                <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-500">Live GPS Tracking</p>
              </div>

              {/* Booking info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Estimated arrival</p>
                  <p className="font-extrabold text-white text-lg">4 mins away</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Est. fare</p>
                  <p className="font-extrabold text-emerald-400 text-lg">₹82</p>
                </div>
                <button className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition">
                  Track →
                </button>
              </div>
            </div>

            {/* Feature mini-cards */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-md">
              {[
                { icon: "⚡", label: "Instant Booking", color: "from-amber-500/20 to-amber-600/10 border-amber-500/20" },
                { icon: "📍", label: "Live GPS", color: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/20" },
                { icon: "⭐", label: "Rate & Review", color: "from-violet-500/20 to-violet-600/10 border-violet-500/20" },
              ].map((f) => (
                <div
                  key={f.label}
                  className={`bg-gradient-to-br ${f.color} border rounded-2xl p-4 text-center backdrop-blur-sm`}
                >
                  <div className="text-2xl mb-1.5">{f.icon}</div>
                  <p className="text-xs font-semibold text-gray-300">{f.label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center py-6 text-xs text-gray-600 border-t border-white/5">
        © 2025 Flowride. Move freely.
      </footer>
    </div>
  );
}
