import { useEffect, useState } from "react";
import { getPassengerProfile, updatePassengerProfile } from "../../services/profileService";
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

export default function PassengerProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({
    name: "",
    rating: "",
    home: { latitude: "", longitude: "" },
    lastKnownLocation: { latitude: "", longitude: "" },
  });
  const [loading, setLoading] = useState(true);

  const loadProfile = () => {
    setLoading(true);
    getPassengerProfile()
      .then((res) => {
        const data = res.data;
        setProfile(data);
        setForm({
          name: data?.name || "",
          rating: data?.rating !== undefined && data?.rating !== null ? data.rating : "",
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
        console.error("Failed to load passenger profile:", err);
        toast.error("Failed to load profile");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

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
        name: form.name,
        rating: form.rating !== "" ? parseFloat(form.rating) : null,
        home: hasHome
          ? { latitude: parseFloat(form.home.latitude), longitude: parseFloat(form.home.longitude) }
          : null,
        lastKnownLocation: hasLastKnown
          ? { latitude: parseFloat(form.lastKnownLocation.latitude), longitude: parseFloat(form.lastKnownLocation.longitude) }
          : null,
      };

      const res = await updatePassengerProfile(payload);
      if (res?.data) {
        setProfile((prev) => ({
          ...prev,
          ...res.data,
          home: payload.home,
          lastKnownLocation: payload.lastKnownLocation,
        }));
      }
      toast.success("Profile updated successfully!");
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

  return (
    <div className="min-h-screen bg-black text-gray-100 py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background ambient glowing blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] rounded-full bg-violet-700/15 blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-3xl" />
      </div>

      <div className="max-w-xl mx-auto relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-semibold text-gray-300 mb-2 backdrop-blur-sm">
            <span>👤</span> Account Settings
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Passenger Profile</h1>
          <p className="text-gray-400 mt-1">Manage your account and preferences</p>
        </div>

        {!editing ? (
          <div className="bg-gray-900/60 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl p-8 space-y-6">
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-cyan-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-violet-700/30">
                {profile?.name?.[0]?.toUpperCase() || "P"}
              </div>
              <div>
                <p className="text-xl font-bold text-white">{profile?.name || "Passenger"}</p>
                <p className="text-gray-400 text-sm">{profile?.email || "—"}</p>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium inline-block mt-1">
                  Passenger #{profile?.id || "—"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <InfoRow label="Phone Number" value={profile?.phoneNumber} />
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
              className="w-full mt-6 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition shadow-lg shadow-violet-700/30"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="bg-gray-900/60 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Edit Profile Details</h2>
              <span className="text-xs text-gray-400">DTO: PassengerUpdateDto</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your name"
              />
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
                className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 4.8"
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
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.home.latitude}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        home: { ...form.home, latitude: e.target.value },
                      })
                    }
                    className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g. 22.3072"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.home.longitude}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        home: { ...form.home, longitude: e.target.value },
                      })
                    }
                    className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g. 73.1812"
                  />
                </div>
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
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.lastKnownLocation.latitude}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        lastKnownLocation: { ...form.lastKnownLocation, latitude: e.target.value },
                      })
                    }
                    className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g. 22.3072"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.lastKnownLocation.longitude}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        lastKnownLocation: { ...form.lastKnownLocation, longitude: e.target.value },
                      })
                    }
                    className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g. 73.1812"
                  />
                </div>
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
