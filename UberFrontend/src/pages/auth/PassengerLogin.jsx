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
      await signinPassenger(form);
      login({ email: form.email, role: "PASSENGER", name: form.email.split("@")[0] });
      toast.success("Welcome back!");
      navigate("/passenger/dashboard");
    } catch (err) {
      toast.error(err.response?.data || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">Sign in</h1>
        <p className="text-gray-500 mb-8">as a Passenger</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password" required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          New here?{" "}
          <Link to="/passenger/signup" className="font-semibold text-black underline">Create account</Link>
        </p>
        <p className="text-center text-sm text-gray-400 mt-2">
          <Link to="/driver/login" className="hover:underline">I&apos;m a Driver →</Link>
        </p>
      </div>
    </div>
  );
}
