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
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Passenger Profile</h1>

        {!editing ? (
          <div className="bg-white rounded-2xl shadow p-8 space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">
                {profile?.name?.[0]?.toUpperCase() || "P"}
              </div>
              <div>
                <p className="text-xl font-bold">{profile?.name || "Passenger"}</p>
                <p className="text-gray-500">{profile?.email || "—"}</p>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-black text-white font-medium inline-block mt-1">
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
              className="w-full mt-6 bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow p-8 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold">Edit Profile Details</h2>
              <span className="text-xs text-gray-400">DTO: PassengerUpdateDto</span>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Rating (0.00 - 5.00)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g. 4.8"
              />
            </div>

            {/* Home Location */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Home Location</span>
                <button
                  type="button"
                  onClick={() => handleUseCurrentLocation("home")}
                  className="text-xs bg-gray-200 hover:bg-gray-300 px-2.5 py-1 rounded font-medium transition"
                >
                  📍 Use Current GPS
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Latitude</label>
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
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="e.g. 22.3072"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Longitude</label>
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
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="e.g. 73.1812"
                  />
                </div>
              </div>
            </div>

            {/* Last Known Location */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Last Known Location</span>
                <button
                  type="button"
                  onClick={() => handleUseCurrentLocation("lastKnownLocation")}
                  className="text-xs bg-gray-200 hover:bg-gray-300 px-2.5 py-1 rounded font-medium transition"
                >
                  📍 Use Current GPS
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Latitude</label>
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
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="e.g. 22.3072"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Longitude</label>
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
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="e.g. 73.1812"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 bg-gray-100 text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition"
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
    <div className="flex justify-between py-3 border-b border-gray-100 items-center">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-semibold text-sm text-gray-900">{value || "—"}</span>
    </div>
  );
}
