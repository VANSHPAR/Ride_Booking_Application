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

// Custom stylish markers matching dark neon aesthetics
const createDivIcon = (emoji, bgClass, label) =>
  new L.DivIcon({
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
        <div style="background:${bgClass}; color:white; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 2.5px solid rgba(255,255,255,0.8); font-size:18px;">
          ${emoji}
        </div>
        ${label ? `<span style="background:rgba(10,10,15,0.9); color:#fff; font-size:10px; font-weight:700; padding:2px 7px; border-radius:6px; margin-top:3px; border:1px solid rgba(255,255,255,0.2); box-shadow:0 2px 6px rgba(0,0,0,0.5); white-space:nowrap;">${label}</span>` : ""}
      </div>
    `,
    className: "custom-map-icon",
    iconSize: [0, 0],
  });

const driverIcon    = createDivIcon("🛞", "linear-gradient(135deg, #f59e0b, #ef4444)", "You (Driver)");
const passengerIcon = createDivIcon("📍", "linear-gradient(135deg, #10b981, #06b6d4)", "Passenger Pickup");
const destinationIcon = createDivIcon("🏁", "linear-gradient(135deg, #8b5cf6, #ec4899)", "Destination");

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
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
    }
  }, [location, rideTarget, map]);

  return null;
}

export default function UnifiedDriverMap({ location, rideTarget }) {
  const center = location?.latitude
    ? [location.latitude, location.longitude]
    : [22.3072, 73.1812];

  const hasPickup =
    rideTarget?.startLocation?.latitude && rideTarget?.startLocation?.longitude;
  const hasDropoff =
    rideTarget?.endLocation?.latitude && rideTarget?.endLocation?.longitude;

  const routePositions =
    location?.latitude && hasPickup
      ? [
          [location.latitude, location.longitude],
          [rideTarget.startLocation.latitude, rideTarget.startLocation.longitude],
        ]
      : [];

  return (
    <div className="relative w-full h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
      {/* Floating status pill overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-gray-950/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-xs font-bold text-gray-200">
          {rideTarget ? "🎯 Navigating Active Assignment" : "📡 Live GPS Broadcast Radar"}
        </span>
      </div>

      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <DriverMapBoundsController location={location} rideTarget={rideTarget} />

        {/* Driver marker */}
        {location?.latitude && (
          <>
            <Marker
              position={[location.latitude, location.longitude]}
              icon={driverIcon}
            >
              <Popup>
                <div className="text-xs p-1">
                  <p className="font-bold text-amber-600 text-sm">🛞 Your Location</p>
                  <p className="text-gray-600 mt-0.5">
                    {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Broadcast pulse circle */}
            <Circle
              center={[location.latitude, location.longitude]}
              radius={500}
              pathOptions={{
                color: "#06b6d4",
                fillColor: "#06b6d4",
                fillOpacity: 0.12,
                weight: 1.5,
              }}
            />
          </>
        )}

        {/* Passenger Pickup marker */}
        {hasPickup && (
          <Marker
            position={[
              rideTarget.startLocation.latitude,
              rideTarget.startLocation.longitude,
            ]}
            icon={passengerIcon}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-cyan-600 text-sm">📍 Passenger Pickup</p>
                <p className="text-gray-600 mt-0.5">
                  {rideTarget.startLocation.latitude.toFixed(5)},{" "}
                  {rideTarget.startLocation.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Passenger Destination marker */}
        {hasDropoff && (
          <Marker
            position={[
              rideTarget.endLocation.latitude,
              rideTarget.endLocation.longitude,
            ]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-violet-700 text-sm">🏁 Trip Destination</p>
                <p className="text-gray-600 mt-0.5">
                  {rideTarget.endLocation.latitude.toFixed(5)},{" "}
                  {rideTarget.endLocation.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Polyline route from driver to passenger pickup */}
        {routePositions.length === 2 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: "#06b6d4",
              weight: 4,
              opacity: 0.85,
              dashArray: "8, 8",
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
