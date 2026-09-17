import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issues in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom stylish markers
const createDivIcon = (emoji, bgClass, label) =>
  new L.DivIcon({
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
        <div style="background:${bgClass}; color:white; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white; font-size:18px;">
          ${emoji}
        </div>
        ${label ? `<span style="background:#111; color:#fff; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; margin-top:2px; box-shadow:0 2px 4px rgba(0,0,0,0.2); white-space:nowrap;">${label}</span>` : ""}
      </div>
    `,
    className: "custom-map-icon",
    iconSize: [0, 0],
  });

const pickupIcon  = createDivIcon("📍", "#10b981", "Pickup");
const dropoffIcon = createDivIcon("🏁", "#000000", "Drop-off");
const driverIcon  = createDivIcon("🚗", "#f59e0b", "Driver");

// Map Events handler to capture clicks
function MapEvents({ activeMode, onSelectPickup, onSelectDropoff }) {
  useMapEvents({
    click(e) {
      const loc = { latitude: e.latlng.lat, longitude: e.latlng.lng };
      if (activeMode === "pickup") {
        onSelectPickup(loc);
      } else if (activeMode === "dropoff") {
        onSelectDropoff(loc);
      }
    },
  });
  return null;
}

// Auto-adjust view to fit all markers
function MapBoundsController({ pickup, dropoff, drivers }) {
  const map = useMap();

  useEffect(() => {
    const points = [];
    if (pickup?.latitude && pickup?.longitude) {
      points.push([pickup.latitude, pickup.longitude]);
    }
    if (dropoff?.latitude && dropoff?.longitude) {
      points.push([dropoff.latitude, dropoff.longitude]);
    }
    if (drivers && drivers.length > 0) {
      drivers.forEach((d) => {
        if (d.latitude && d.longitude) {
          points.push([d.latitude, d.longitude]);
        }
      });
    }

    if (points.length === 1) {
      map.setView(points[0], 14, { animate: true });
    } else if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, maxZoom: 16 });
    }
  }, [pickup, dropoff, drivers, map]);

  return null;
}

export default function UnifiedRideMap({
  pickup,
  dropoff,
  drivers = [],
  onSelectPickup,
  onSelectDropoff,
  activeMode = "pickup",
  setActiveMode,
  onClearPickup,
  onClearDropoff,
}) {
  const defaultCenter = [22.3072, 73.1812]; // Vadodara default or India
  const center = pickup
    ? [pickup.latitude, pickup.longitude]
    : dropoff
    ? [dropoff.latitude, dropoff.longitude]
    : defaultCenter;

  const polylinePositions =
    pickup && dropoff
      ? [
          [pickup.latitude, pickup.longitude],
          [dropoff.latitude, dropoff.longitude],
        ]
      : [];

  return (
    <div className="relative w-full h-[580px] rounded-3xl overflow-hidden shadow-xl border border-gray-200">
      {/* Floating Mode Selector Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
            Click map to set:
          </span>
          <button
            type="button"
            onClick={() => setActiveMode("pickup")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeMode === "pickup"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>📍</span>
            <span>Pickup Point</span>
            {pickup && <span className="w-2 h-2 rounded-full bg-emerald-300 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("dropoff")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeMode === "dropoff"
                ? "bg-black text-white shadow-md shadow-black/30 scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>🏁</span>
            <span>Drop-off Point</span>
            {dropoff && <span className="w-2 h-2 rounded-full bg-blue-400 ml-0.5" />}
          </button>
        </div>

        {/* Quick status badges / clear buttons */}
        <div className="flex items-center gap-2 text-xs">
          {pickup && (
            <button
              type="button"
              onClick={onClearPickup}
              className="text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-lg font-medium transition"
              title="Clear pickup"
            >
              Clear 📍
            </button>
          )}
          {dropoff && (
            <button
              type="button"
              onClick={onClearDropoff}
              className="text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-lg font-medium transition"
              title="Clear drop-off"
            >
              Clear 🏁
            </button>
          )}
        </div>
      </div>

      {/* Main Map Container */}
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map Click Handler */}
        <MapEvents
          activeMode={activeMode}
          onSelectPickup={onSelectPickup}
          onSelectDropoff={onSelectDropoff}
        />

        {/* Auto fit all points */}
        <MapBoundsController pickup={pickup} dropoff={dropoff} drivers={drivers} />

        {/* Pickup Marker */}
        {pickup?.latitude && (
          <Marker position={[pickup.latitude, pickup.longitude]} icon={pickupIcon}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-emerald-700 text-sm">📍 Pickup Location</p>
                <p className="text-gray-600 mt-1">
                  {pickup.latitude.toFixed(5)}, {pickup.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Search Radius around Pickup */}
        {pickup?.latitude && (
          <Circle
            center={[pickup.latitude, pickup.longitude]}
            radius={5000}
            pathOptions={{
              color: "#10b981",
              fillColor: "#10b981",
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: "6, 6",
            }}
          />
        )}

        {/* Drop-off Marker */}
        {dropoff?.latitude && (
          <Marker position={[dropoff.latitude, dropoff.longitude]} icon={dropoffIcon}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-gray-900 text-sm">🏁 Destination</p>
                <p className="text-gray-600 mt-1">
                  {dropoff.latitude.toFixed(5)}, {dropoff.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Line connecting Pickup to Drop-off */}
        {polylinePositions.length === 2 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: "#111827",
              weight: 4,
              opacity: 0.8,
              dashArray: "10, 10",
            }}
          />
        )}

        {/* Nearby Drivers Markers */}
        {drivers.map((d, index) => {
          if (!d.latitude || !d.longitude) return null;
          return (
            <Marker
              key={d.driverId || index}
              position={[d.latitude, d.longitude]}
              icon={driverIcon}
            >
              <Popup>
                <div className="text-xs p-1">
                  <p className="font-bold text-amber-700 text-sm">🚗 Driver #{d.driverId}</p>
                  <p className="text-gray-600 mt-0.5">
                    Location: {d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}
                  </p>
                  {d.distance !== undefined && (
                    <p className="text-emerald-700 font-semibold mt-1">
                      Distance: ~{d.distance.toFixed(2)} km
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Legend & Info Box at Bottom */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span>Pickup</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-black inline-block" />
          <span>Destination</span>
        </div>
        {drivers.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span>{drivers.length} Drivers Nearby</span>
          </div>
        )}
      </div>
    </div>
  );
}
