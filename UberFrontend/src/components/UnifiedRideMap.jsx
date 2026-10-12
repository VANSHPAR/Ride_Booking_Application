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

// Custom stylish markers with dark theme styling
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

const pickupIcon  = createDivIcon("📍", "linear-gradient(135deg, #10b981, #06b6d4)", "Pickup");
const dropoffIcon = createDivIcon("🏁", "linear-gradient(135deg, #8b5cf6, #ec4899)", "Drop-off");
const driverIcon  = createDivIcon("🛞", "linear-gradient(135deg, #f59e0b, #ef4444)", "Driver");

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
    drivers?.forEach((d) => {
      if (d.latitude && d.longitude) {
        points.push([d.latitude, d.longitude]);
      }
    });

    if (points.length === 1) {
      map.setView(points[0], 14, { animate: true });
    } else if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
    }
  }, [pickup, dropoff, drivers, map]);

  return null;
}

export default function UnifiedRideMap({
  pickup,
  dropoff,
  drivers = [],
  activeMode,
  setActiveMode,
  onSelectPickup,
  onSelectDropoff,
  onClearPickup,
  onClearDropoff,
}) {
  const center = pickup?.latitude
    ? [pickup.latitude, pickup.longitude]
    : [22.3072, 73.1812];

  const routePositions =
    pickup?.latitude && dropoff?.latitude
      ? [
          [pickup.latitude, pickup.longitude],
          [dropoff.latitude, dropoff.longitude],
        ]
      : [];

  return (
    <div className="relative w-full h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
      {/* Floating Mode Selector Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 bg-gray-950/80 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
            Click map to set:
          </span>
          <button
            type="button"
            onClick={() => setActiveMode("pickup")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeMode === "pickup"
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/25 scale-105"
                : "bg-white/10 text-gray-300 hover:bg-white/15"
            }`}
          >
            <span>📍</span>
            <span>Pickup Point</span>
            {pickup && <span className="w-2 h-2 rounded-full bg-cyan-300 ml-0.5 animate-pulse" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("dropoff")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeMode === "dropoff"
                ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/25 scale-105"
                : "bg-white/10 text-gray-300 hover:bg-white/15"
            }`}
          >
            <span>🏁</span>
            <span>Drop-off Point</span>
            {dropoff && <span className="w-2 h-2 rounded-full bg-pink-300 ml-0.5 animate-pulse" />}
          </button>
        </div>

        {/* Quick status badges / clear buttons */}
        <div className="flex items-center gap-2 text-xs">
          {pickup && (
            <button
              type="button"
              onClick={onClearPickup}
              className="text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-2.5 py-1 rounded-lg font-medium transition border border-white/10"
              title="Clear pickup"
            >
              Clear 📍
            </button>
          )}
          {dropoff && (
            <button
              type="button"
              onClick={onClearDropoff}
              className="text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-2.5 py-1 rounded-lg font-medium transition border border-white/10"
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
                <p className="font-bold text-cyan-600 text-sm">📍 Pickup Location</p>
                <p className="text-gray-600 mt-1">
                  {pickup.latitude.toFixed(5)}, {pickup.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Drop-off Marker */}
        {dropoff?.latitude && (
          <Marker position={[dropoff.latitude, dropoff.longitude]} icon={dropoffIcon}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-violet-700 text-sm">🏁 Drop-off Location</p>
                <p className="text-gray-600 mt-1">
                  {dropoff.latitude.toFixed(5)}, {dropoff.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Line connecting Pickup and Dropoff */}
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

        {/* 5 km Search Radius Circle around Pickup */}
        {pickup?.latitude && (
          <Circle
            center={[pickup.latitude, pickup.longitude]}
            radius={5000}
            pathOptions={{
              color: "#06b6d4",
              fillColor: "#06b6d4",
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: "6, 6",
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
                  <p className="font-bold text-amber-600 text-sm">
                    🛞 Driver #{d.driverId}
                  </p>
                  <p className="text-gray-600 mt-0.5">
                    {d.latitude.toFixed(5)}, {d.longitude.toFixed(5)}
                  </p>
                  {d.distance !== undefined && (
                    <p className="text-cyan-600 font-semibold mt-1">
                      Distance: ~{d.distance.toFixed(2)} km
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
