import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getNearbyDrivers } from "../../services/locationService";
import { createBooking } from "../../services/bookingService";
import { getPassengerProfile } from "../../services/profileService";
import MapPicker from "../../components/MapPicker";
import DriversMap from "../../components/DriversMap";
import { toast } from "react-toastify";

export default function PassengerDashboard() {
  const { user, login } = useAuth();
  const [pickup, setPickup]       = useState(null);
  const [dropoff, setDropoff]     = useState(null);
  const [drivers, setDrivers]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [booking, setBooking]     = useState(null);
  const [step, setStep]           = useState("pickup"); // pickup | dropoff | drivers | booked

  useEffect(() => {
    getPassengerProfile()
      .then((res) => {
        if (res.data?.id && res.data.id !== user?.id) {
          login({ ...user, id: res.data.id, name: res.data.name || user?.name });
        }
      })
      .catch((err) => {
        console.warn("Could not load passenger profile id:", err);
      });
  }, []);

  const handleGeolocate = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickup({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        toast.success("Location detected!");
        setStep("dropoff");
      },
      () => toast.error("Could not get your location")
    );
  };

  const handleFindDrivers = async () => {
    if (!pickup) return toast.error("Select your pickup location first");
    setLoading(true);
    try {
      const res = await getNearbyDrivers(pickup.latitude, pickup.longitude);
      setDrivers(res.data || []);
      setStep("drivers");
      if (res.data.length === 0) toast.info("No drivers nearby right now");
    } catch (err) {
      console.error("Failed to fetch nearby drivers:", err);
      toast.error(err.response?.data?.message || err.response?.data || "Could not fetch nearby drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!pickup) return toast.error("Select pickup location");
    setLoading(true);
    try {
      const payload = {
        passengerId: user.id || 1,
        startLocation: pickup,
        endLocation: dropoff || pickup,
      };
      const res = await createBooking(payload);
      setBooking(res.data);
      setStep("booked");
      toast.success("Ride booked! Finding your driver...");
    } catch (err) {
      toast.error(err.response?.data || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-1">Good day, {user?.name}! 👋</h1>
        <p className="text-gray-500 mb-8">Where are you going?</p>

        {step === "booked" ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold mb-2">Ride Booked!</h2>
            <p className="text-gray-500 mb-4">Booking ID: <span className="font-mono font-bold">#{booking?.bookingId}</span></p>
            <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold text-sm">
              {booking?.bookingStatus}
            </span>
            <p className="text-gray-400 text-sm mt-4">A driver is being assigned. Check My Bookings for updates.</p>
            <button onClick={() => { setStep("pickup"); setBooking(null); setDrivers([]); setPickup(null); setDropoff(null); }}
              className="mt-6 bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition font-semibold">
              Book Another
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left panel */}
            <div className="space-y-5">
              {/* Step 1 - Pickup */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-bold mb-3">📍 Pickup Location</h2>
                <button onClick={handleGeolocate}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-black font-semibold py-2 px-4 rounded-lg transition mb-3 text-sm">
                  📡 Use My Current Location
                </button>
                {pickup
                  ? <p className="text-sm text-gray-500 bg-green-50 p-3 rounded-lg">✅ {pickup.latitude.toFixed(5)}, {pickup.longitude.toFixed(5)}</p>
                  : <p className="text-sm text-gray-400">Click on the map or use GPS above</p>}
              </div>

              {/* Step 2 - Dropoff */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-bold mb-3">🏁 Drop-off Location</h2>
                {dropoff
                  ? <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">✅ {dropoff.latitude.toFixed(5)}, {dropoff.longitude.toFixed(5)}</p>
                  : <p className="text-sm text-gray-400">Click the right map to set drop-off</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={handleFindDrivers} disabled={!pickup || loading}
                  className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition disabled:opacity-40">
                  {loading ? "Searching..." : "🔍 Find Drivers"}
                </button>
                <button onClick={handleBook} disabled={!pickup || loading}
                  className="flex-1 bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-900 transition disabled:opacity-40">
                  {loading ? "Booking..." : "⚡ Book Ride"}
                </button>
              </div>

              {/* Nearby drivers list */}
              {drivers.length > 0 && (
                <div className="bg-white rounded-2xl shadow p-5">
                  <h3 className="font-bold mb-3">🚗 {drivers.length} Drivers Nearby</h3>
                  <div className="space-y-2">
                    {drivers.map((d, i) => (
                      <div key={i} className="flex justify-between text-sm border-b pb-2">
                        <span>Driver #{d.driverId}</span>
                        <span className="text-gray-500">{d.distance?.toFixed(2) || "~"} km away</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right - Maps */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Pickup Map</p>
                <MapPicker position={pickup} onSelect={(loc) => { setPickup(loc); setStep("dropoff"); }} label="Click to set pickup" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Drop-off Map</p>
                <MapPicker position={dropoff} onSelect={setDropoff} label="Click to set drop-off" />
              </div>
              {drivers.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Nearby Drivers</p>
                  <DriversMap passengerLocation={pickup} drivers={drivers} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
