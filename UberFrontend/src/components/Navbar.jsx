import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isPassenger = user?.role === "PASSENGER";
  const isDriver    = user?.role === "DRIVER";

  return (
    <nav className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link to="/" className="text-2xl font-bold tracking-tight">
        🚗 <span className="text-white">Uber</span>
      </Link>

      {user && (
        <div className="flex items-center gap-6 text-sm font-medium">
          {isPassenger && (
            <>
              <Link to="/passenger/dashboard" className="hover:text-gray-300 transition">Book Ride</Link>
              <Link to="/passenger/bookings"  className="hover:text-gray-300 transition">My Bookings</Link>
              <Link to="/passenger/reviews"   className="hover:text-gray-300 transition">Reviews</Link>
              <Link to="/passenger/profile"   className="hover:text-gray-300 transition">Profile</Link>
            </>
          )}
          {isDriver && (
            <>
              <Link to="/driver/dashboard" className="hover:text-gray-300 transition">Dashboard</Link>
              <Link to="/driver/profile"   className="hover:text-gray-300 transition">Profile</Link>
            </>
          )}
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-600">
            <span className="text-gray-400">{user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
