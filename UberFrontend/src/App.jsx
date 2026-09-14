import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";

import Navbar          from "./components/Navbar";
import ProtectedRoute  from "./components/ProtectedRoute";

import Landing           from "./pages/Landing";
import PassengerLogin    from "./pages/auth/PassengerLogin";
import PassengerSignup   from "./pages/auth/PassengerSignup";
import DriverLogin       from "./pages/auth/DriverLogin";
import DriverSignup      from "./pages/auth/DriverSignup";

import PassengerDashboard from "./pages/passenger/PassengerDashboard";
import BookingHistory     from "./pages/passenger/BookingHistory";
import PassengerProfile   from "./pages/passenger/PassengerProfile";
import Reviews            from "./pages/passenger/Reviews";

import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverProfile   from "./pages/driver/DriverProfile";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public */}
              <Route path="/"                 element={<Landing />} />
              <Route path="/passenger/login"  element={<PassengerLogin />} />
              <Route path="/passenger/signup" element={<PassengerSignup />} />
              <Route path="/driver/login"     element={<DriverLogin />} />
              <Route path="/driver/signup"    element={<DriverSignup />} />

              {/* Passenger protected */}
              <Route path="/passenger/dashboard"
                element={<ProtectedRoute role="PASSENGER"><PassengerDashboard /></ProtectedRoute>} />
              <Route path="/passenger/bookings"
                element={<ProtectedRoute role="PASSENGER"><BookingHistory /></ProtectedRoute>} />
              <Route path="/passenger/profile"
                element={<ProtectedRoute role="PASSENGER"><PassengerProfile /></ProtectedRoute>} />
              <Route path="/passenger/reviews"
                element={<ProtectedRoute role="PASSENGER"><Reviews /></ProtectedRoute>} />

              {/* Driver protected */}
              <Route path="/driver/dashboard"
                element={<ProtectedRoute role="DRIVER"><DriverDashboard /></ProtectedRoute>} />
              <Route path="/driver/profile"
                element={<ProtectedRoute role="DRIVER"><DriverProfile /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} pauseOnHover />
      </AuthProvider>
    </BrowserRouter>
  );
}
