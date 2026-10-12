import { useEffect, useState } from "react";
import {
  getDriverProfile,
  updateDriverProfile,
  updateDriverAvailability,
} from "../../services/profileService";
import { toast } from "react-toastify";

const formatLocation = (loc) => {
  if (
    loc &&
    loc.latitude !== undefined &&
    loc.latitude !== null &&
    loc.latitude !== "" &&
    loc.longitude !== undefined &&
    loc.longitude !== null &&
    loc.longitude !== ""
  ) {
    const lat = Number(loc.latitude);
    const lng = Number(loc.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      return `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
  return "Not set";
};

export default function DriverProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const [form, setForm] = useState({
    name: "",
    licenseNumber: "",
    activeCity: "",
    aadharNumber: "",
    rating: "",
    isAvailable: true,
    home: { latitude: "", longitude: "" },
    lastKnownLocation: { latitude: "", longitude: "" },
  });

  const loadProfile = () => {
    setLoading(true);
    getDriverProfile()
      .then((res) => {
        const data = res.data;
        setProfile(data);
        const available = data?.isAvailable !== undefined ? data.isAvailable : Boolean(data?.available);
        setForm({
          name: data?.name || "",
          licenseNumber: data?.licenseNumber || "",
          activeCity: data?.activeCity || "",
          aadharNumber: data?.aadharNumber || "",
          rating: data?.rating !== undefined && data?.rating !== null ? data.rating : "",
          isAvailable: available,
          home: {
            latitude: data?.home?.latitude !== undefined && data?.home?.latitude !== null ? data.home.latitude : "",
            longitude: data?.home?.longitude !== undefined && data?.home?.longitude !== null ? data.home.longitude : "",
          },
          lastKnownLocation: {
            latitude: data?.lastKnownLocation?.latitude !== undefined && data?.lastKnownLocation?.latitude !== null ? data.lastKnownLocation.latitude : "",
            longitude: data?.lastKnownLocation?.longitude !== undefined && data?.lastKnownLocation?.longitude !== null ? data.lastKnownLocation.longitude : "",
          },
        });
      })
      .catch((err) => {
        console.error("Failed to load driver profile:", err);
        toast.error("Failed to load profile");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleToggleAvailability = async () => {
    const currentStatus = profile?.isAvailable !== undefined ? profile.isAvailable : Boolean(profile?.available);
    const newStatus = !currentStatus;
    setUpdatingAvailability(true);
    try {
      await updateDriverAvailability(newStatus);
      setProfile((prev) => ({ ...prev, isAvailable: newStatus, available: newStatus }));
      setForm((prev) => ({ ...prev, isAvailable: newStatus }));
      toast.success(newStatus ? "You are now ONLINE and available for rides!" : "You are now OFFLINE");
    } catch (err) {
      console.error("Failed to update availability:", err);
      toast.error("Could not update availability status");
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleUseCurrentLocation = (field) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          [field]: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
        }));
        toast.success(`Updated ${field === "home" ? "Home" : "Last Known"} coordinates!`);
      },
      () => toast.error("Could not fetch current coordinates")
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const hasHome = form.home.latitude !== "" && form.home.longitude !== "" && !isNaN(Number(form.home.latitude)) && !isNaN(Number(form.home.longitude));
      const hasLastKnown = form.lastKnownLocation.latitude !== "" && form.lastKnownLocation.longitude !== "" && !isNaN(Number(form.lastKnownLocation.latitude)) && !isNaN(Number(form.lastKnownLocation.longitude));

      const payload = {
        id: profile?.id || 1,
        name: form.name,
        licenseNumber: form.licenseNumber,
        activeCity: form.activeCity,
        aadharNumber: form.aadharNumber,
        isAvailable: form.isAvailable,
        rating: form.rating !== "" ? parseFloat(form.rating) : null,
        home: hasHome
          ? { latitude: parseFloat(form.home.latitude), longitude: parseFloat(form.home.longitude) }
          : null,
        lastKnownLocation: hasLastKnown
          ? { latitude: parseFloat(form.lastKnownLocation.latitude), longitude: parseFloat(form.lastKnownLocation.longitude) }
          : null,
      };

      const res = await updateDriverProfile(payload);
      if (res?.data) {
        setProfile((prev) => ({
          ...prev,
          ...res.data,
          home: payload.home,
          lastKnownLocation: payload.lastKnownLocation,
        }));
      }
      toast.success("Driver profile updated successfully!");
      setEditing(false);
      loadProfile();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || err.response?.data || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 bg-black min-h-screen">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAvailable = profile?.isAvailable !== undefined ? profile.isAvailable : Boolean(profile?.available);

  return (
    <div className="min-h-screen bg-black text-gray-100 py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background ambient glowing blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] rounded-full bg-violet-700/15 blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-semibold text-gray-300 mb-2 backdrop-blur-sm">
            <span>🛞</span> Driver Identity
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Driver Profile</h1>
          <p className="text-gray-400 mt-1">Manage your driver credentials and broadcast settings</p>
        </div>

        {!editing ? (
          <div className="bg-gray-900/60 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-cyan-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-violet-700/30">
                  {profile?.name?.[0]?.toUpperCase() || "D"}
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{profile?.name || "Driver"}</p>
                  <p className="text-gray-400 text-sm">{profile?.email || "—"}</p>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium inline-block mt-1">
                    Driver #{profile?.id || "—"}
                  </span>
                </div>
              </div>

              {/* Instant availability toggle */}
              <div className="text-right">
                <span className="text-xs text-gray-400 block mb-1">Availability</span>
                <button
                  type="button"
                  disabled={updatingAvailability}
                  onClick={handleToggleAvailability}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
                    isAvailable
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                      : "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30"
                  }`}
                >
                  {isAvailable ? "🟢 Online" : "🔴 Offline"}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <InfoRow label="Phone Number"   value={profile?.phoneNumber} />
              <InfoRow label="License Number" value={profile?.licenseNumber} />
              <InfoRow label="Aadhar Number"  value={profile?.aadharNumber} />
              <InfoRow label="Active City"    value={profile?.activeCity} />
              <InfoRow
                label="Rating"
                value={profile?.rating !== undefined && profile?.rating !== null ? `⭐ ${profile.rating}` : "No rating yet"}
              />
              <InfoRow
                label="Home Location"
                value={formatLocation(profile?.home)}
              />
              <InfoRow
                label="Last Known Location"
                value={formatLocation(profile?.lastKnownLocation)}
              />
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full mt-4 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition shadow-lg shadow-violet-700/30"
            >
              Edit Profile Details
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="bg-gray-900/60 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Edit Profile Details</h2>
              <span className="text-xs text-gray-400">DTO: DriverUpdateDto</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">License Number</label>
                <input
                  type="text"
                  required
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Aadhar Number</label>
                <input
                  type="text"
                  value={form.aadharNumber}
                  onChange={(e) => setForm({ ...form, aadharNumber: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Active City</label>
                <input
                  type="text"
                  value={form.activeCity}
                  onChange={(e) => setForm({ ...form, activeCity: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Rating (0.00 - 5.00)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              />
            </div>

            {/* Home Location */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Home Location</span>
                <button
                  type="button"
                  onClick={() => handleUseCurrentLocation("home")}
                  className="text-xs bg-white/10 hover:bg-white/20 text-cyan-300 border border-white/15 px-3 py-1 rounded-lg font-medium transition"
                >
                  📍 Use Current GPS
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={form.home.latitude}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      home: { ...form.home, latitude: e.target.value },
                    })
                  }
                  className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={form.home.longitude}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      home: { ...form.home, longitude: e.target.value },
                    })
                  }
                  className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Last Known Location */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Last Known Location</span>
                <button
                  type="button"
                  onClick={() => handleUseCurrentLocation("lastKnownLocation")}
                  className="text-xs bg-white/10 hover:bg-white/20 text-cyan-300 border border-white/15 px-3 py-1 rounded-lg font-medium transition"
                >
                  📍 Use Current GPS
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={form.lastKnownLocation.latitude}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lastKnownLocation: { ...form.lastKnownLocation, latitude: e.target.value },
                    })
                  }
                  className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={form.lastKnownLocation.longitude}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lastKnownLocation: { ...form.lastKnownLocation, longitude: e.target.value },
                    })
                  }
                  className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition shadow-lg shadow-violet-700/30"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold py-3.5 rounded-2xl transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-3 border-b border-white/5 items-center">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="font-semibold text-sm text-gray-100">{value || "—"}</span>
    </div>
  );
}
