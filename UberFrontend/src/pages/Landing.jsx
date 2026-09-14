import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "PASSENGER") navigate("/passenger/dashboard");
    else if (user?.role === "DRIVER")   navigate("/driver/dashboard");
  }, [user]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left */}
        <div className="flex flex-col justify-center px-12 py-16 lg:w-1/2">
          <h1 className="text-6xl font-extrabold leading-tight mb-6">
            Go anywhere<br />with <span className="text-white underline decoration-4">Uber</span>
          </h1>
          <p className="text-gray-400 text-xl mb-12 max-w-md">
            Request a ride, hop in, and go. Book your trip in seconds and connect with nearby drivers in real time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/passenger/login")}
              className="bg-white text-black font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-200 transition"
            >
              🧍 I&apos;m a Passenger
            </button>
            <button
              onClick={() => navigate("/driver/login")}
              className="bg-gray-800 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-700 transition border border-gray-600"
            >
              🚗 I&apos;m a Driver
            </button>
          </div>
        </div>

        {/* Right — decorative */}
        <div className="lg:w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-16">
          <div className="text-center">
            <div className="text-[120px] mb-4">🚗</div>
            <p className="text-gray-400 text-lg">Real-time ride matching</p>
            <div className="mt-8 flex gap-6 justify-center text-sm text-gray-500">
              <div className="bg-gray-700 rounded-xl p-4 w-36 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <p>Instant booking</p>
              </div>
              <div className="bg-gray-700 rounded-xl p-4 w-36 text-center">
                <div className="text-3xl mb-2">📍</div>
                <p>Live GPS tracking</p>
              </div>
              <div className="bg-gray-700 rounded-xl p-4 w-36 text-center">
                <div className="text-3xl mb-2">⭐</div>
                <p>Rate your ride</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
