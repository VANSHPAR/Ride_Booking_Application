import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupPassenger } from "../../services/authService";
import { toast } from "react-toastify";

export default function PassengerSignup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phoneNumber: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signupPassenger(form);
      toast.success("Account created! Please sign in.");
      navigate("/passenger/login");
    } catch (err) {
      toast.error(err.response?.data || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        type={type} required
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">Create account</h1>
        <p className="text-gray-500 mb-8">as a Passenger</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {field("name",        "Full Name",    "text",     "John Doe")}
          {field("email",       "Email",        "email",    "you@example.com")}
          {field("password",    "Password",     "password", "••••••••")}
          {field("phoneNumber", "Phone Number", "tel",      "+91 9876543210")}
          <button
            type="submit" disabled={loading}
            className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/passenger/login" className="font-semibold text-black underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
