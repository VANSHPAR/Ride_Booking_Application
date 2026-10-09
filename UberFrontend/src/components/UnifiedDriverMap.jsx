import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom stylish markers matching UnifiedRideMap
const createDivIcon = (emoji, bgClass, label) =>
  new L.DivIcon({
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
        <div style="background:${bgClass}; color:white; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2.5px solid white; font-size:19px;">
          ${emoji}
        </div>
        ${label ? `<span style="background:#111; color:#fff; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; margin-top:2px; box-shadow:0 2px 4px rgba(0,0,0,0.2); white-space:nowrap;">${label}</span>` : ""}
      </div>
    `,
    className: "custom-map-icon",
    iconSize: [0, 0],
  });

const driverIcon    = createDivIcon("🚗", "#f59e0b", "You (Driver)");
const passengerIcon = createDivIcon("📍", "#10b981", "Passenger Pickup");
const destinationIcon = createDivIcon("🏁", "#000000", "Destination");

// Auto-adjust view to fit driver position and any active request points
function DriverMapBoundsController({ location, rideTarget }) {
  const map = useMap();

  useEffect(() => {
    const points = [];
    if (location?.latitude && location?.longitude) {
      points.push([location.latitude, location.longitude]);
    }
    if (rideTarget?.startLocation?.latitude && rideTarget?.startLocation?.longitude) {
      points.push([rideTarget.startLocation.latitude, rideTarget.startLocation.longitude]);
    }
    if (rideTarget?.endLocation?.latitude && rideTarget?.endLocation?.longitude) {
      points.push([rideTarget.endLocation.latitude, rideTarget.endLocation.longitude]);
    }

    if (points.length === 1) {
      map.setView(points[0], 15, { animate: true });
    } else if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, maxZoom: 16 });
    }
  }, [location, rideTarget, map]);

  return null;
}

export default function UnifiedDriverMap({
  location,
  online,
  rideRequest,
  onRefreshGps,
}) {
  const defaultCenter = [22.3072, 73.1812];
  const center = location
    ? [location.latitude, location.longitude]
    : defaultCenter;

  const routePolyline =
    location && rideRequest?.startLocation
      ? [
          [location.latitude, location.longitude],
          [rideRequest.startLocation.latitude, rideRequest.startLocation.longitude],
        ]
      : [];

  return (
    <div className="relative w-full h-[580px] rounded-3xl overflow-hidden shadow-xl border border-gray-200">
      {/* Floating Top Status Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-3 h-3 rounded-full ${
              online ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
            }`}
          />
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            {online ? "Online & Broadcasting GPS" : "Offline"}
          </span>
          {location && (
            <span className="text-[11px] font-mono text-gray-500 hidden sm:inline bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
              📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefreshGps && (
            <button
              type="button"
              onClick={onRefreshGps}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              title="Sync GPS location"
            >
              <span>📡</span>
              <span>Sync GPS</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <DriverMapBoundsController location={location} rideTarget={rideRequest} />

        {/* Driver's Live Location Marker */}
        {location && (
          <Marker
            position={[location.latitude, location.longitude]}
            icon={driverIcon}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-amber-800 text-sm">🚗 Your Cab Location</p>
                <p className="text-gray-600 mt-1">
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </p>
                <p className="text-emerald-700 font-semibold mt-1">
                  Status: {online ? "Online (Broadcasting)" : "Offline"}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Search / Service Range Radius Circle */}
        {location && (
          <Circle
            center={[location.latitude, location.longitude]}
            radius={online ? 5000 : 1000}
            pathOptions={{
              color: online ? "#10b981" : "#9ca3af",
              fillColor: online ? "#10b981" : "#9ca3af",
              fillOpacity: online ? 0.08 : 0.03,
              weight: 1.5,
              dashArray: "6, 6",
            }}
          />
        )}

        {/* Passenger Pickup Point (if incoming or accepted ride request has coordinates) */}
        {rideRequest?.startLocation && (
          <Marker
            position={[
              rideRequest.startLocation.latitude,
              rideRequest.startLocation.longitude,
            ]}
            icon={passengerIcon}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-emerald-700 text-sm">📍 Passenger Pickup</p>
                <p className="text-gray-600">Booking #{rideRequest.bookingId}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Drop-off Point (if available) */}
        {rideRequest?.endLocation && (
          <Marker
            position={[
              rideRequest.endLocation.latitude,
              rideRequest.endLocation.longitude,
            ]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-gray-900 text-sm">🏁 Drop-off Destination</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Line from Driver to Passenger Pickup */}
        {routePolyline.length === 2 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: "#f59e0b",
              weight: 4,
              opacity: 0.8,
              dashArray: "8, 8",
            }}
          />
        )}
      </MapContainer>

      {/* Floating Legend at Bottom */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span>Your Cab</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span>{online ? "5km Service Area" : "Coverage Range"}</span>
        </div>
        {rideRequest?.startLocation && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-700 inline-block" />
            <span>Passenger Pickup</span>
          </div>
        )}
      </div>
    </div>
  );
}
