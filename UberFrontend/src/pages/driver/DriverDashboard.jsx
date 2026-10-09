import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { saveDriverLocation } from "../../services/locationService";
import { getDriverProfile } from "../../services/profileService";
import { useWebSocket } from "../../hooks/useWebSocket";
import UnifiedDriverMap from "../../components/UnifiedDriverMap";
import { toast } from "react-toastify";

export default function DriverDashboard() {
  const { user, login } = useAuth();
  const [online, setOnline] = useState(false);
  const [location, setLocation] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);
  const [acceptedRide, setAcceptedRide] = useState(null);
  const [status, setStatus] = useState("Offline");
  const [countdown, setCountdown] = useState(30);

  const intervalRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const currentRideRequestRef = useRef(null);
  currentRideRequestRef.current = rideRequest;

  useEffect(() => {
    getDriverProfile()
      .then((res) => {
        if (res.data?.id && res.data.id !== user?.id) {
          login({ ...user, id: res.data.id, name: res.data.name || user?.name });
        }
      })
      .catch((err) => {
        console.warn("Could not load driver profile id:", err);
      });
  }, []);

  const { sendRideResponse } = useWebSocket({
    driverId: user?.id,
    enabled: online,
    onRideRequest: (data) => {
      // If driver is already on an active accepted trip, ignore new incoming requests
      if (acceptedRide) return;

      setRideRequest(data);
      setCountdown(30);
      setStatus(`New ride request from Passenger #${data.passengerId}!`);
      toast.info(`🚕 New ride request! Passenger #${data.passengerId} (Booking #${data.bookingId})`);

      // Start 30-second countdown timer
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            setRideRequest(null);
            setStatus("Online — waiting for rides");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onRideAccepted: (data) => {
      // When ANY driver accepts a ride:
      // If this dashboard has the same bookingId displayed and it was accepted by someone else:
      if (
        currentRideRequestRef.current &&
        Number(currentRideRequestRef.current.bookingId) === Number(data?.bookingId) &&
        Number(data?.driverId) !== Number(user?.id)
      ) {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        setRideRequest(null);
        setStatus("Online — waiting for rides");
        toast.info(`ℹ️ Ride #${data.bookingId} was accepted by another driver.`);
      }
    },
  });

  const publishLocation = (lat, lng) => {
    saveDriverLocation(user?.id || 1, lat, lng)
      .then(() => console.log("Location updated in Redis"))
      .catch((err) => console.error("Error updating location:", err));
  };

  const syncGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ latitude: lat, longitude: lng });
        if (online) {
          publishLocation(lat, lng);
        }
        toast.success("GPS Location updated!");
      },
      () => toast.error("Could not retrieve GPS location. Please enable location services.")
    );
  };

  const goOnline = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ latitude: lat, longitude: lng });
        publishLocation(lat, lng);
        setOnline(true);
        setStatus("Online — broadcasting to nearby passengers");
        toast.success("You are now ONLINE and available for rides!");

        // Push GPS every 30 seconds
        intervalRef.current = setInterval(() => {
          navigator.geolocation.getCurrentPosition((p) => {
            setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude });
            publishLocation(p.coords.latitude, p.coords.longitude);
          });
        }, 30000);
      },
      () => toast.error("Could not get your location. Please enable GPS permissions.")
    );
  };

  const goOffline = () => {
    clearInterval(intervalRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setOnline(false);
    setRideRequest(null);
    setAcceptedRide(null);
    setStatus("Offline");
    toast.info("You are now OFFLINE");
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const handleAccept = () => {
    if (!rideRequest) return;
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    const accepted = { ...rideRequest };
    sendRideResponse(user?.id || 1, { response: "true", bookingId: accepted.bookingId });
    setAcceptedRide(accepted);
    setRideRequest(null); // Dismiss request immediately on accept
    toast.success(`Ride #${accepted.bookingId} accepted! Booking updated to SCHEDULED.`);
    setStatus(`Assigned to Booking #${accepted.bookingId} — Head to passenger pickup point!`);
  };

  const handleReject = () => {
    if (!rideRequest) return;
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    sendRideResponse(user?.id || 1, { response: "false", bookingId: rideRequest.bookingId });
    setRideRequest(null); // Dismiss request immediately on decline
    setStatus("Online — waiting for rides");
    toast.info("Ride request declined.");
  };

  const handleCompleteTrip = () => {
    setAcceptedRide(null);
    setStatus("Online — broadcasting to nearby passengers");
    toast.success("Trip completed! You are ready for new ride requests.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">
              Driver Cockpit, {user?.name || "Driver"} 🚖
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Broadcast your GPS coordinates to get matched with nearby passengers in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={syncGps}
              className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 font-semibold px-4 py-2 rounded-xl text-sm transition shadow-sm flex items-center gap-2"
            >
              <span>📡</span>
              <span>Sync Current GPS</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Controls, Ride Request Modal, and Status (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Online / Offline Control Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-gray-900">Broadcast Status</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    online ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {online ? "🟢 Active & Online" : "⚫ Offline"}
                </span>
              </div>

              <p className="text-gray-500 text-xs leading-relaxed">{status}</p>

              {!online ? (
                <button
                  type="button"
                  onClick={goOnline}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm"
                >
                  <span>🟢</span>
                  <span>Go Online & Start Driving</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goOffline}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl transition shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  <span>⚫</span>
                  <span>Go Offline</span>
                </button>
              )}

              {location && (
                <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between text-xs text-gray-600">
                  <span className="font-medium">Broadcast Coordinates:</span>
                  <span className="font-mono font-bold text-gray-900">
                    {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                  </span>
                </div>
              )}
            </div>

            {/* Live Incoming Ride Request Card */}
            {rideRequest && (
              <div className="bg-black text-white rounded-2xl shadow-2xl p-6 space-y-4 border border-gray-800 animate-fade-in">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl animate-bounce">🚕</span>
                    <div>
                      <h3 className="text-base font-bold">New Ride Request!</h3>
                      <p className="text-xs text-emerald-400 font-semibold">Immediate Assignment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-800 font-bold">
                      ⏱ {countdown}s
                    </span>
                    <span className="text-xs font-mono bg-gray-800 px-2.5 py-1 rounded-full text-gray-300">
                      #{rideRequest.bookingId}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between py-1 border-b border-gray-900">
                    <span>Passenger:</span>
                    <span className="font-bold text-white">#{rideRequest.passengerId}</span>
                  </div>
                  {rideRequest.startLocation && (
                    <div className="flex justify-between py-1 border-b border-gray-900">
                      <span>Pickup:</span>
                      <span className="font-mono text-emerald-400">
                        {rideRequest.startLocation.latitude.toFixed(4)},{" "}
                        {rideRequest.startLocation.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                  {rideRequest.endLocation && (
                    <div className="flex justify-between py-1 border-b border-gray-900">
                      <span>Drop-off:</span>
                      <span className="font-mono text-gray-300">
                        {rideRequest.endLocation.latitude.toFixed(4)},{" "}
                        {rideRequest.endLocation.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition text-sm shadow-md"
                  >
                    ✅ Accept Ride
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition text-sm"
                  >
                    ✕ Decline
                  </button>
                </div>
              </div>
            )}

            {/* Active Accepted Trip Card */}
            {acceptedRide && (
              <div className="bg-emerald-950 text-white rounded-2xl shadow-xl p-6 space-y-4 border border-emerald-700/60 animate-fade-in">
                <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚖</span>
                    <div>
                      <h3 className="text-base font-bold text-white">Active Assigned Trip</h3>
                      <p className="text-xs text-emerald-300 font-medium">Status: SCHEDULED</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-emerald-900 px-3 py-1 rounded-full text-emerald-200 border border-emerald-700">
                    Booking #{acceptedRide.bookingId}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-emerald-100">
                  <div className="flex justify-between py-1 border-b border-emerald-900/60">
                    <span className="text-emerald-300">Passenger ID:</span>
                    <span className="font-bold text-white">#{acceptedRide.passengerId}</span>
                  </div>
                  {acceptedRide.startLocation && (
                    <div className="flex justify-between py-1 border-b border-emerald-900/60">
                      <span className="text-emerald-300">📍 Pickup Coordinates:</span>
                      <span className="font-mono text-emerald-200 font-bold">
                        {acceptedRide.startLocation.latitude.toFixed(4)},{" "}
                        {acceptedRide.startLocation.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                  {acceptedRide.endLocation && (
                    <div className="flex justify-between py-1 border-b border-emerald-900/60">
                      <span className="text-emerald-300">🏁 Drop-off Coordinates:</span>
                      <span className="font-mono text-emerald-200">
                        {acceptedRide.endLocation.latitude.toFixed(4)},{" "}
                        {acceptedRide.endLocation.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCompleteTrip}
                    className="w-full bg-white text-emerald-950 hover:bg-emerald-100 font-extrabold py-3 rounded-xl transition text-sm shadow-md"
                  >
                    🏁 Mark Trip Completed
                  </button>
                </div>
              </div>
            )}

            {/* Quick Tips Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Live Driver Guidelines
              </h4>
              <ul className="text-xs text-gray-600 space-y-1.5 leading-relaxed">
                <li>• Your location is automatically broadcasted to Redis every 30 seconds when online.</li>
                <li>• Keep your browser tab active to receive STOMP WebSocket ride dispatches.</li>
                <li>• If another driver accepts a ride first, it will automatically clear from your queue.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Unified Driver Map (7 Cols) */}
          <div className="lg:col-span-7">
            <UnifiedDriverMap
              location={location}
              online={online}
              rideRequest={acceptedRide || rideRequest}
              onRefreshGps={syncGps}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
