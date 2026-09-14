import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const carIcon = new L.DivIcon({
  html: '<div style="font-size:24px">🚗</div>',
  className: "",
  iconAnchor: [12, 12],
});

const passengerIcon = new L.DivIcon({
  html: '<div style="font-size:24px">📍</div>',
  className: "",
  iconAnchor: [12, 24],
});

export default function DriversMap({ passengerLocation, drivers = [] }) {
  if (!passengerLocation) return null;
  const center = [passengerLocation.latitude, passengerLocation.longitude];

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Passenger location */}
        <Marker position={center} icon={passengerIcon}>
          <Popup>Your location</Popup>
        </Marker>

        {/* 5km search radius */}
        <Circle center={center} radius={5000} pathOptions={{ color: "black", fillOpacity: 0.05 }} />

        {/* Nearby drivers */}
        {drivers.map((d, i) => (
          <Marker key={i} position={[d.latitude, d.longitude]} icon={carIcon}>
            <Popup>Driver ID: {d.driverId}<br />Distance: {d.distance?.toFixed(2)} km</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
