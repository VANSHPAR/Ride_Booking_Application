import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Don't render the global navbar on the landing page (which has its own full hero header)
  if (location.pathname === "/") {
    return null;
  }

  const isPassenger = user?.role === "PASSENGER";
  const isDriver    = user?.role === "DRIVER";

  const navLinkClass = (path) =>
    `text-sm font-medium transition px-3 py-1.5 rounded-xl ${
      location.pathname === path
        ? "text-cyan-400 bg-white/10 font-semibold"
        : "text-gray-300 hover:text-white hover:bg-white/5"
    }`;

  return (
    <nav className="bg-gray-950/80 backdrop-blur-md border-b border-white/10 text-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-lg">
      <Link to="/" className="flex items-center gap-2 group">
        <span className="text-2xl transition group-hover:scale-110">🌊</span>
        <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Flowride
        </span>
      </Link>

      {user && (
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            {isPassenger && (
              <>
                <Link to="/passenger/dashboard" className={navLinkClass("/passenger/dashboard")}>Book Ride</Link>
                <Link to="/passenger/bookings"  className={navLinkClass("/passenger/bookings")}>My Bookings</Link>
                <Link to="/passenger/reviews"   className={navLinkClass("/passenger/reviews")}>Reviews</Link>
                <Link to="/passenger/profile"   className={navLinkClass("/passenger/profile")}>Profile</Link>
              </>
            )}
            {isDriver && (
              <>
                <Link to="/driver/dashboard" className={navLinkClass("/driver/dashboard")}>Cockpit</Link>
                <Link to="/driver/bookings"  className={navLinkClass("/driver/bookings")}>My Rides</Link>
                <Link to="/driver/profile"   className={navLinkClass("/driver/profile")}>Profile</Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 ml-2 pl-3 border-l border-white/15">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-gray-200 leading-tight">{user.name}</span>
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider">{user.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-3.5 py-1.5 rounded-full transition hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
