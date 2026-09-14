import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

export default function MapPicker({ position, onSelect, label = "Pick location" }) {
  const defaultCenter = [20.5937, 78.9629]; // India center
  const center = position ? [position.latitude, position.longitude] : defaultCenter;

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <p className="text-xs text-gray-500 px-2 py-1 bg-gray-50">{label} — click on the map</p>
      <MapContainer center={center} zoom={position ? 14 : 5} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler onSelect={onSelect} />
        {position && <Marker position={[position.latitude, position.longitude]} />}
      </MapContainer>
    </div>
  );
}
