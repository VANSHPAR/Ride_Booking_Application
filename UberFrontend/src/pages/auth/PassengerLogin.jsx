import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signinPassenger } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function PassengerLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signinPassenger(form);
      login({ id: res.data?.id, email: form.email, role: "PASSENGER", name: form.email.split("@")[0] });
      toast.success("Welcome back!");
      navigate("/passenger/dashboard");
    } catch (err) {
      toast.error(err.response?.data || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background ambient glowing blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-700/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-600/20 blur-3xl animate-pulse" />
      </div>

      <div className="bg-gray-900/70 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">🌊</span>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Flowride
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-1">Sign In</h1>
        <p className="text-gray-400 mb-8 text-sm">as a Passenger</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 via-cyan-600 to-emerald-600 hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-violet-700/30 disabled:opacity-50 text-sm hover:scale-[1.02]"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          New here?{" "}
          <Link to="/passenger/signup" className="font-semibold text-cyan-400 hover:underline">
            Create account
          </Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          <Link to="/driver/login" className="hover:text-gray-300 transition">
            I&apos;m a Driver →
          </Link>
        </p>
      </div>
    </div>
  );
}
