import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getNearbyDrivers } from "../../services/locationService";
import { createBooking, getMyBookings, cancelBooking } from "../../services/bookingService";
import { getPassengerProfile } from "../../services/profileService";
import UnifiedRideMap from "../../components/UnifiedRideMap";
import { toast } from "react-toastify";

// Helper to calculate approximate distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function PassengerDashboard() {
  const { user, login } = useAuth();
  const [pickup, setPickup]       = useState(null);
  const [dropoff, setDropoff]     = useState(null);
  const [drivers, setDrivers]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [booking, setBooking]     = useState(null);
  const [step, setStep]           = useState("pickup"); // pickup | booked
  const [activeMapMode, setActiveMapMode] = useState("pickup"); // "pickup" | "dropoff"
  const [cancelling, setCancelling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch actual profile ID on mount
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

  // Poll booking status every 2.5 seconds when booked and waiting for driver
  useEffect(() => {
    if (step !== "booked" || !booking?.bookingId) return;

    if (
      booking.bookingStatus === "SCHEDULED" ||
      booking.bookingStatus === "COMPLETED" ||
      booking.bookingStatus === "CANCELLED"
    ) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await getMyBookings();
        const list = res.data || [];
        const current = list.find((b) => b.bookingId === booking.bookingId);
        if (current && current.bookingStatus !== booking.bookingStatus) {
          setBooking(current);
          if (current.bookingStatus === "SCHEDULED") {
            toast.success(`🎉 Driver #${current.driverId || ""} accepted your ride! Status is now SCHEDULED!`);
          } else if (current.bookingStatus === "CANCELLED") {
            toast.info("This ride has been cancelled.");
          }
        }
      } catch (err) {
        console.warn("Polling booking status error:", err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [step, booking?.bookingId, booking?.bookingStatus]);

  const refreshBookingStatus = async (showToast = false) => {
    if (!booking?.bookingId) return;
    setRefreshing(true);
    try {
      const res = await getMyBookings();
      const list = res.data || [];
      const current = list.find((b) => b.bookingId === booking.bookingId);
      if (current) {
        setBooking(current);
        if (showToast) {
          toast.info(`Status refreshed: ${current.bookingStatus}`);
        }
      }
    } catch (err) {
      console.warn("Refresh status error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking?.bookingId) return;
    setCancelling(true);
    try {
      await cancelBooking(booking.bookingId);
      toast.success("Ride cancelled successfully.");
      setBooking((prev) => ({ ...prev, bookingStatus: "CANCELLED" }));
    } catch (err) {
      console.error("Cancel failed:", err);
      toast.error(err.response?.data?.message || err.response?.data || "Could not cancel ride");
    } finally {
      setCancelling(false);
    }
  };

  // Calculate distance & estimate fare
  const tripDistance = useMemo(() => {
    if (pickup?.latitude && dropoff?.latitude) {
      return calculateDistance(
        pickup.latitude,
        pickup.longitude,
        dropoff.latitude,
        dropoff.longitude
      );
    }
    return null;
  }, [pickup, dropoff]);

  const estimatedFare = useMemo(() => {
    if (!tripDistance) return null;
    const baseFare = 50; // base ₹50
    const perKmRate = 14; // ₹14 / km
    return Math.round(baseFare + tripDistance * perKmRate);
  }, [tripDistance]);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setPickup(loc);
        setActiveMapMode("dropoff");
        toast.success("Pickup set to your current GPS location!");
      },
      () => toast.error("Could not retrieve your location")
    );
  };

  const handleSelectPickup = (loc) => {
    setPickup(loc);
    toast.info("Pickup point updated!");
    if (!dropoff) {
      setActiveMapMode("dropoff");
    }
  };

  const handleSelectDropoff = (loc) => {
    setDropoff(loc);
    toast.info("Drop-off point updated!");
  };

  const handleFindDrivers = async () => {
    if (!pickup) return toast.error("Select your pickup location on the map first");
    setLoading(true);
    try {
      const res = await getNearbyDrivers(pickup.latitude, pickup.longitude);
      const list = res.data || [];
      setDrivers(list);
      if (list.length === 0) {
        toast.info("No active drivers found nearby right now");
      } else {
        toast.success(`Found ${list.length} nearby driver(s) on the map!`);
      }
    } catch (err) {
      console.error("Failed to fetch nearby drivers:", err);
      toast.error(err.response?.data?.message || err.response?.data || "Could not fetch nearby drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!pickup) return toast.error("Please set a pickup location on the map");
    setLoading(true);
    try {
      const payload = {
        passengerId: user?.id || 1,
        startLocation: pickup,
        endLocation: dropoff || pickup,
      };
      const res = await createBooking(payload);
      setBooking(res.data);
      setStep("booked");
      toast.success("Ride booked! Searching for nearby driver...");
    } catch (err) {
      console.error("Booking failed:", err);
      toast.error(err.response?.data || "Booking request failed");
    } finally {
      setLoading(false);
    }
  };

  const isScheduled = booking?.bookingStatus === "SCHEDULED";
  const isCancelled = booking?.bookingStatus === "CANCELLED";

  return (
    <div className="min-h-screen bg-black text-gray-100 py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Background ambient glowing blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] rounded-full bg-violet-700/15 blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-semibold text-gray-300 mb-2 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Passenger Cockpit
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Book a Ride,{" "}
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                {user?.name || "Passenger"}
              </span>{" "}
              👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Select your pickup and drop-off points directly on the interactive map.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGeolocate}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-4 py-2.5 rounded-2xl text-sm transition backdrop-blur-sm shadow-md flex items-center gap-2 hover:scale-105"
            >
              <span>📡</span>
              <span>Use Current GPS</span>
            </button>
          </div>
        </div>

        {step === "booked" ? (
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-xl mx-auto text-center border border-white/10 animate-fade-in space-y-6">
            <div className="text-6xl mb-2">
              {isScheduled ? "🎉" : isCancelled ? "🚫" : "🌊"}
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-white">
                {isScheduled
                  ? "Ride Confirmed & Scheduled!"
                  : isCancelled
                  ? "Ride Cancelled"
                  : "Ride Requested!"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Booking Reference:{" "}
                <span className="font-mono font-bold text-cyan-400">#{booking?.bookingId}</span>
              </p>
            </div>

            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2">
              <span
                className={`px-5 py-2 rounded-full font-extrabold text-sm tracking-wide shadow-md ${
                  isScheduled
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : isCancelled
                    ? "bg-red-500/20 text-red-300 border border-red-500/40"
                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse"
                }`}
              >
                ● Status: {booking?.bookingStatus || "ASSIGNING_DRIVER"}
              </span>
            </div>

            {/* Assigned Driver Details Card if Scheduled */}
            {isScheduled && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 text-left space-y-2 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                    <span>🛞</span> Assigned Driver
                  </span>
                  <span className="font-mono font-extrabold text-emerald-300 bg-emerald-900/60 px-3 py-0.5 rounded-full border border-emerald-500/40 text-xs">
                    Driver #{booking?.driverId || "Assigned"}
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  Your driver has accepted your ride request and is heading to your pickup location.
                </p>
                {booking?.startLocation && (
                  <div className="text-xs text-emerald-300 pt-1 flex justify-between">
                    <span>📍 Pickup Point:</span>
                    <span className="font-mono">
                      {booking.startLocation.latitude?.toFixed(4)}, {booking.startLocation.longitude?.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {!isScheduled && !isCancelled && (
              <p className="text-gray-400 text-xs leading-relaxed max-w-md mx-auto">
                We have notified nearby drivers. Your screen will automatically update to <strong>SCHEDULED</strong> the moment a driver accepts.
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {!isScheduled && !isCancelled && (
                <>
                  <button
                    type="button"
                    disabled={refreshing}
                    onClick={() => refreshBookingStatus(true)}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-2xl transition text-sm flex items-center justify-center gap-2 border border-white/15"
                  >
                    <span>🔄</span>
                    <span>{refreshing ? "Checking..." : "Refresh Status"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={handleCancelBooking}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold px-6 py-3 rounded-2xl transition text-sm flex items-center justify-center gap-2"
                  >
                    <span>✕</span>
                    <span>{cancelling ? "Cancelling..." : "Cancel Ride"}</span>
                  </button>
                </>
              )}

              {(isScheduled || isCancelled) && (
                <button
                  type="button"
                  onClick={() => {
                    setStep("pickup");
                    setBooking(null);
                    setDrivers([]);
                    setPickup(null);
                    setDropoff(null);
                  }}
                  className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-8 py-3.5 rounded-2xl hover:opacity-90 transition font-bold text-sm shadow-lg shadow-violet-700/30"
                >
                  Book Another Ride
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Ride Controls & Fare Summary (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Pickup Location Card */}
              <div
                onClick={() => setActiveMapMode("pickup")}
                className={`cursor-pointer rounded-2xl p-5 transition border backdrop-blur-md ${
                  activeMapMode === "pickup"
                    ? "bg-gray-900/90 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400"
                    : "bg-gray-900/50 border-white/10 hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white flex items-center justify-center text-xs font-bold">
                      A
                    </span>
                    <h3 className="font-bold text-white text-base">Pickup Location</h3>
                  </div>
                  {activeMapMode === "pickup" && (
                    <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/20 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                      Selecting on map...
                    </span>
                  )}
                </div>

                {pickup ? (
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl">
                    <p className="text-xs font-mono font-medium text-cyan-300">
                      📍 {pickup.latitude.toFixed(5)}, {pickup.longitude.toFixed(5)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPickup(null);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    Click anywhere on the map to set your pickup point.
                  </p>
                )}
              </div>

              {/* Drop-off Location Card */}
              <div
                onClick={() => setActiveMapMode("dropoff")}
                className={`cursor-pointer rounded-2xl p-5 transition border backdrop-blur-md ${
                  activeMapMode === "dropoff"
                    ? "bg-gray-900/90 border-violet-400 shadow-lg shadow-violet-500/20 ring-1 ring-violet-400"
                    : "bg-gray-900/50 border-white/10 hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white flex items-center justify-center text-xs font-bold">
                      B
                    </span>
                    <h3 className="font-bold text-white text-base">Drop-off Location</h3>
                  </div>
                  {activeMapMode === "dropoff" && (
                    <span className="text-[11px] font-bold text-violet-400 bg-violet-500/20 px-2.5 py-0.5 rounded-full border border-violet-500/30">
                      Selecting on map...
                    </span>
                  )}
                </div>

                {dropoff ? (
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl">
                    <p className="text-xs font-mono font-medium text-violet-300">
                      🏁 {dropoff.latitude.toFixed(5)}, {dropoff.longitude.toFixed(5)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropoff(null);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    Click anywhere on the map to set your destination.
                  </p>
                )}
              </div>

              {/* Trip Estimate Summary */}
              {tripDistance !== null && (
                <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3 shadow-lg">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Ride Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                      <span className="text-xs text-gray-400 block">Est. Distance</span>
                      <span className="text-lg font-extrabold text-white">
                        {tripDistance.toFixed(2)} km
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                      <span className="text-xs text-gray-400 block">Est. Fare</span>
                      <span className="text-lg font-extrabold text-emerald-400">
                        ₹{estimatedFare}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={handleFindDrivers}
                  disabled={!pickup || loading}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3.5 px-6 rounded-2xl transition disabled:opacity-40 backdrop-blur-sm flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <span>🔍</span>
                  <span>{loading ? "Searching Nearby Drivers..." : "Find Nearby Drivers"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBook}
                  disabled={!pickup || loading}
                  className="w-full bg-gradient-to-r from-violet-600 via-cyan-600 to-emerald-600 hover:opacity-90 text-white font-bold py-3.5 px-6 rounded-2xl transition disabled:opacity-40 shadow-xl shadow-cyan-600/25 flex items-center justify-center gap-2 text-base hover:scale-[1.02]"
                >
                  <span>⚡</span>
                  <span>Confirm & Book Ride</span>
                </button>
              </div>

              {/* Nearby Drivers list */}
              {drivers.length > 0 && (
                <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <span>🛞</span>
                      <span>{drivers.length} Drivers Found in Range</span>
                    </h4>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold px-2.5 py-0.5 rounded-full">
                      5 km range
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {drivers.map((d, i) => (
                      <div
                        key={d.driverId || i}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🛞</span>
                          <div>
                            <p className="font-bold text-gray-200">Driver #{d.driverId}</p>
                            <p className="text-gray-400 text-[10px]">
                              {d.latitude?.toFixed(4)}, {d.longitude?.toFixed(4)}
                            </p>
                          </div>
                        </div>
                        {d.distance !== undefined && (
                          <span className="font-bold text-cyan-400">
                            ~{d.distance.toFixed(2)} km
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Unified Interactive Map */}
            <div className="lg:col-span-7">
              <UnifiedRideMap
                pickup={pickup}
                dropoff={dropoff}
                drivers={drivers}
                activeMode={activeMapMode}
                setActiveMode={setActiveMapMode}
                onSelectPickup={handleSelectPickup}
                onSelectDropoff={handleSelectDropoff}
                onClearPickup={() => setPickup(null)}
                onClearDropoff={() => setDropoff(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
