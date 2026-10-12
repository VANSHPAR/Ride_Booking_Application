import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { saveDriverLocation, removeDriverLocation } from "../../services/locationService";
import { getDriverProfile } from "../../services/profileService";
import { useWebSocket } from "../../hooks/useWebSocket";
import UnifiedDriverMap from "../../components/UnifiedDriverMap";
import { toast } from "react-toastify";

export default function DriverDashboard() {
  const { user, login } = useAuth();

  // Restore online state from localStorage
  const [online, setOnline] = useState(() => {
    return localStorage.getItem("driver_online") === "true";
  });
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem("driver_location");
    return saved ? JSON.parse(saved) : null;
  });
  const [rideRequest, setRideRequest] = useState(null);
  const [acceptedRide, setAcceptedRide] = useState(null);
  const [status, setStatus] = useState(() =>
    localStorage.getItem("driver_online") === "true"
      ? "Online — broadcasting to nearby passengers"
      : "Offline"
  );
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

  useEffect(() => {
    if (online) {
      intervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition((p) => {
          const lat = p.coords.latitude;
          const lng = p.coords.longitude;
          setLocation({ latitude: lat, longitude: lng });
          localStorage.setItem("driver_location", JSON.stringify({ latitude: lat, longitude: lng }));
          publishLocation(lat, lng);
        });
      }, 30000);
    }
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [online]);

  const { sendRideResponse } = useWebSocket({
    driverId: user?.id,
    enabled: online,
    onRideRequest: (data) => {
      if (acceptedRide) return;

      setRideRequest(data);
      setCountdown(30);
      setStatus(`New ride request from Passenger #${data.passengerId}!`);
      toast.info(`⚡ New ride request! Passenger #${data.passengerId} (Booking #${data.bookingId})`);

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
      if (
        currentRideRequestRef.current &&
        Number(currentRideRequestRef.current.bookingId) === Number(data?.bookingId) &&
        Number(data?.driverId) !== Number(user?.id)
      ) {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        setRideRequest(null);
        setStatus("Online — waiting for rides");
        toast.warn(`Booking #${data?.bookingId} was accepted by another driver.`);
      }
    },
  });

  const publishLocation = async (lat, lng) => {
    try {
      await saveDriverLocation({
        driverId: user?.id || 1,
        latitude: lat,
        longitude: lng,
      });
    } catch (err) {
      console.warn("Could not publish location:", err);
    }
  };

  const goOnline = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        setLocation({ latitude: lat, longitude: lng });
        localStorage.setItem("driver_location", JSON.stringify({ latitude: lat, longitude: lng }));
        publishLocation(lat, lng);

        intervalRef.current = setInterval(() => {
          navigator.geolocation.getCurrentPosition((pos) => {
            const curLat = pos.coords.latitude;
            const curLng = pos.coords.longitude;
            setLocation({ latitude: curLat, longitude: curLng });
            localStorage.setItem("driver_location", JSON.stringify({ latitude: curLat, longitude: curLng }));
            publishLocation(curLat, curLng);
          });
        }, 30000);

        setOnline(true);
        localStorage.setItem("driver_online", "true");
        setStatus("Online — broadcasting to nearby passengers");
        toast.success("You are now ONLINE and discoverable by passengers!");
      },
      () => toast.error("Could not retrieve current GPS coordinates")
    );
  };

  const goOffline = async () => {
    clearInterval(intervalRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setOnline(false);
    localStorage.removeItem("driver_online");
    setRideRequest(null);
    setStatus("Offline");

    try {
      await removeDriverLocation(user?.id || 1);
    } catch (err) {
      console.warn("Could not remove driver location:", err);
    }
    toast.info("You are now OFFLINE.");
  };

  const syncGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        setLocation({ latitude: lat, longitude: lng });
        localStorage.setItem("driver_location", JSON.stringify({ latitude: lat, longitude: lng }));
        if (online) publishLocation(lat, lng);
        toast.success("GPS synchronized!");
      },
      () => toast.error("Could not fetch GPS")
    );
  };

  const handleAccept = () => {
    if (!rideRequest) return;
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    sendRideResponse(user?.id || 1, { response: "true", bookingId: rideRequest.bookingId });

    const accepted = { ...rideRequest };
    setAcceptedRide(accepted);
    setRideRequest(null);
    toast.success(`Ride #${accepted.bookingId} accepted! Booking updated to SCHEDULED.`);
    setStatus(`Assigned to Booking #${accepted.bookingId} — Head to passenger pickup point!`);
  };

  const handleReject = () => {
    if (!rideRequest) return;
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    sendRideResponse(user?.id || 1, { response: "false", bookingId: rideRequest.bookingId });
    setRideRequest(null);
    setStatus("Online — waiting for rides");
    toast.info("Ride request declined.");
  };

  const handleCompleteTrip = () => {
    setAcceptedRide(null);
    setStatus("Online — broadcasting to nearby passengers");
    toast.success("Trip completed! You are ready for new ride requests.");
  };

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
              <span className={`w-2 h-2 rounded-full ${online ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
              Driver Operations
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Driver Cockpit,{" "}
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                {user?.name || "Driver"}
              </span>{" "}
              🛞
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Broadcast your GPS coordinates to get matched with nearby passengers in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={syncGps}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-4 py-2.5 rounded-2xl text-sm transition backdrop-blur-sm shadow-md flex items-center gap-2 hover:scale-105"
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
            <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-white">Broadcast Status</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    online
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-gray-800 text-gray-400 border-white/10"
                  }`}
                >
                  {online ? "🟢 Active & Online" : "⚫ Offline"}
                </span>
              </div>

              <p className="text-gray-400 text-xs leading-relaxed">{status}</p>

              {!online ? (
                <button
                  type="button"
                  onClick={goOnline}
                  className="w-full bg-gradient-to-r from-emerald-600 via-cyan-600 to-violet-600 hover:opacity-90 text-white font-bold py-3.5 rounded-2xl transition shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm hover:scale-[1.02]"
                >
                  <span>⚡</span>
                  <span>Go Online (Start Broadcasting)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goOffline}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 text-sm"
                >
                  <span>⏹</span>
                  <span>Go Offline (Stop Broadcasting)</span>
                </button>
              )}
            </div>

            {/* GPS Telemetry Card */}
            <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Current Location Telemetry
              </h3>

              {location ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <span className="text-xs text-gray-400 block">Latitude</span>
                    <span className="text-sm font-mono font-bold text-cyan-300">
                      {location.latitude.toFixed(5)}
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <span className="text-xs text-gray-400 block">Longitude</span>
                    <span className="text-sm font-mono font-bold text-cyan-300">
                      {location.longitude.toFixed(5)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  GPS position has not been captured yet. Click &quot;Sync Current GPS&quot; above.
                </p>
              )}
            </div>

            {/* Active Accepted Trip Card */}
            {acceptedRide && (
              <div className="bg-gradient-to-br from-emerald-950/60 to-cyan-950/40 border-2 border-emerald-500/40 rounded-2xl p-6 space-y-4 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Trip In Progress
                  </span>
                  <span className="font-mono text-xs font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Booking #{acceptedRide.bookingId}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-400">Passenger ID:</span>
                    <span className="font-bold text-white">#{acceptedRide.passengerId}</span>
                  </div>
                  {acceptedRide.startLocation && (
                    <div className="flex justify-between text-gray-300">
                      <span className="text-gray-400">Pickup:</span>
                      <span className="font-mono text-cyan-300">
                        {acceptedRide.startLocation.latitude?.toFixed(4)},{" "}
                        {acceptedRide.startLocation.longitude?.toFixed(4)}
                      </span>
                    </div>
                  )}
                  {acceptedRide.endLocation && (
                    <div className="flex justify-between text-gray-300">
                      <span className="text-gray-400">Destination:</span>
                      <span className="font-mono text-violet-300">
                        {acceptedRide.endLocation.latitude?.toFixed(4)},{" "}
                        {acceptedRide.endLocation.longitude?.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCompleteTrip}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white font-bold py-3 rounded-xl transition text-xs shadow-lg shadow-emerald-500/30"
                >
                  ✓ Complete Trip &amp; Ready for Next
                </button>
              </div>
            )}

            {/* Incoming Real-time Ride Request Popup / Modal */}
            {rideRequest && (
              <div className="bg-gradient-to-br from-violet-950/80 via-gray-900/90 to-cyan-950/80 rounded-2xl border-2 border-cyan-400/80 p-6 space-y-4 shadow-2xl backdrop-blur-md animate-bounce-short">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <h3 className="font-extrabold text-white text-base">
                      Incoming Ride Match!
                    </h3>
                  </div>
                  <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-xs px-2.5 py-1 rounded-full animate-pulse">
                    ⏱ {countdown}s left
                  </span>
                </div>

                <div className="space-y-2 bg-white/5 border border-white/10 p-3.5 rounded-xl text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Booking Ref:</span>
                    <span className="font-mono font-bold text-white">#{rideRequest.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Passenger:</span>
                    <span className="font-bold text-cyan-300">Passenger #{rideRequest.passengerId}</span>
                  </div>
                  {rideRequest.startLocation && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pickup GPS:</span>
                      <span className="font-mono text-white">
                        {rideRequest.startLocation.latitude?.toFixed(4)},{" "}
                        {rideRequest.startLocation.longitude?.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white font-extrabold py-3 rounded-xl transition shadow-lg shadow-emerald-500/30 text-xs"
                  >
                    ✓ Accept Ride
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-red-300 border border-red-500/30 font-bold py-3 rounded-xl transition text-xs"
                  >
                    ✕ Decline
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Unified Driver Map (7 Cols) */}
          <div className="lg:col-span-7">
            <UnifiedDriverMap
              location={location}
              rideTarget={acceptedRide || rideRequest}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
