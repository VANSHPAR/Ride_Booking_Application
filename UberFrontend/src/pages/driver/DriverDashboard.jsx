import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { saveDriverLocation } from "../../services/locationService";
import { getDriverProfile } from "../../services/profileService";
import { useWebSocket } from "../../hooks/useWebSocket";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { toast } from "react-toastify";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function DriverDashboard() {
  const { user, login } = useAuth();
  const [online, setOnline] = useState(false);
  const [location, setLocation] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);
  const [status, setStatus] = useState("Offline");
  const intervalRef = useRef(null);

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
      setRideRequest(data);
      setStatus("Ride request received!");
      toast.info(`🚕 New ride request! Passenger #${data.passengerId}`);
    },
  });

  const publishLocation = (lat, lng) => {
    saveDriverLocation(user.id || 1, lat, lng)
      .then(() => console.log("Location updated"))
      .catch(console.error);
  };

  const goOnline = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        setLocation({ latitude: lat, longitude: lng });
        publishLocation(lat, lng);
        setOnline(true);
        setStatus("Online — waiting for rides");
        toast.success("You are now Online!");

        // Push GPS every 30 seconds
        intervalRef.current = setInterval(() => {
          navigator.geolocation.getCurrentPosition((p) => {
            setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude });
            publishLocation(p.coords.latitude, p.coords.longitude);
          });
        }, 30000);
      },
      () => toast.error("Could not get your location. Enable GPS.")
    );
  };

  const goOffline = () => {
    clearInterval(intervalRef.current);
    setOnline(false);
    setRideRequest(null);
    setStatus("Offline");
    toast.info("You are now Offline");
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const handleAccept = () => {
    if (!rideRequest) return;
    sendRideResponse(user.id || 1, { response: "ACCEPT", bookingId: rideRequest.bookingId });
    toast.success("Ride accepted! Head to pickup location.");
    setRideRequest(null);
    setStatus("Heading to passenger...");
  };

  const handleReject = () => {
    if (!rideRequest) return;
    sendRideResponse(user.id || 1, { response: "REJECT", bookingId: rideRequest.bookingId });
    setRideRequest(null);
    setStatus("Online — waiting for rides");
    toast.info("Ride rejected");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-1">Driver Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome, {user?.name}</p>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Status panel */}
          <div className="space-y-4">
            {/* Online/Offline toggle */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Status</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${online ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                  {online ? "🟢 Online" : "⚫ Offline"}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4">{status}</p>
              {!online ? (
                <button onClick={goOnline}
                  className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">
                  🟢 Go Online
                </button>
              ) : (
                <button onClick={goOffline}
                  className="w-full bg-gray-200 text-black font-bold py-3 rounded-xl hover:bg-gray-300 transition">
                  ⚫ Go Offline
                </button>
              )}
              {location && (
                <p className="text-xs text-gray-400 mt-3 text-center">
                  📍 {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </p>
              )}
            </div>

            {/* Ride request card */}
            {rideRequest && (
              <div className="bg-black text-white rounded-2xl shadow-xl p-6 animate-pulse-once">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🚕</div>
                  <h2 className="text-xl font-bold">New Ride Request!</h2>
                  <p className="text-gray-400 text-sm mt-1">Passenger #{rideRequest.passengerId}</p>
                  <p className="text-gray-400 text-sm">Booking #{rideRequest.bookingId}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAccept}
                    className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition">
                    ✅ Accept
                  </button>
                  <button onClick={handleReject}
                    className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition">
                    ✕ Reject
                  </button>
                </div>
              </div>
            )}

            {/* Tips */}
            {online && !rideRequest && (
              <div className="bg-blue-50 rounded-2xl p-5">
                <p className="text-sm font-semibold text-blue-800">💡 Tips</p>
                <ul className="text-sm text-blue-600 mt-2 space-y-1">
                  <li>• Your location updates every 30 seconds</li>
                  <li>• Stay in areas with high demand</li>
                  <li>• Ride requests appear here instantly</li>
                </ul>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-bold text-sm">Your Location</h2>
            </div>
            <div style={{ height: "400px" }}>
              {location ? (
                <MapContainer center={[location.latitude, location.longitude]} zoom={15} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[location.latitude, location.longitude]}>
                    <Popup>You are here 🚗</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="text-5xl mb-3">📍</div>
                  <p className="text-sm">Go online to see your location on the map</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
