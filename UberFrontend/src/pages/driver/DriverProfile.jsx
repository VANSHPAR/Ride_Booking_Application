import { useEffect, useState } from "react";
import {
  getDriverProfile,
  updateDriverProfile,
  updateDriverAvailability,
} from "../../services/profileService";
import { toast } from "react-toastify";

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
            latitude: data?.home?.latitude !== undefined ? data.home.latitude : "",
            longitude: data?.home?.longitude !== undefined ? data.home.longitude : "",
          },
          lastKnownLocation: {
            latitude: data?.lastKnownLocation?.latitude !== undefined ? data.lastKnownLocation.latitude : "",
            longitude: data?.lastKnownLocation?.longitude !== undefined ? data.lastKnownLocation.longitude : "",
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
      const payload = {
        name: form.name,
        licenseNumber: form.licenseNumber,
        activeCity: form.activeCity,
        aadharNumber: form.aadharNumber,
        isAvailable: form.isAvailable,
        rating: form.rating !== "" ? parseFloat(form.rating) : null,
        home: form.home.latitude !== "" && form.home.longitude !== ""
          ? { latitude: parseFloat(form.home.latitude), longitude: parseFloat(form.home.longitude) }
          : null,
        lastKnownLocation: form.lastKnownLocation.latitude !== "" && form.lastKnownLocation.longitude !== ""
          ? { latitude: parseFloat(form.lastKnownLocation.latitude), longitude: parseFloat(form.lastKnownLocation.longitude) }
          : null,
      };

      await updateDriverProfile(payload);
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
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAvailable = profile?.isAvailable !== undefined ? profile.isAvailable : Boolean(profile?.available);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Driver Profile</h1>

        {!editing ? (
          <div className="bg-white rounded-2xl shadow p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  {profile?.name?.[0]?.toUpperCase() || "D"}
                </div>
                <div>
                  <p className="text-xl font-bold">{profile?.name || "Driver"}</p>
                  <p className="text-gray-500">{profile?.email || "—"}</p>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-black text-white font-medium inline-block mt-1">
                    Driver #{profile?.id || "—"}
                  </span>
                </div>
              </div>

              {/* Instant availability toggle */}
              <div className="text-right">
                <span className="text-xs text-gray-500 block mb-1">Availability</span>
                <button
                  type="button"
                  disabled={updatingAvailability}
                  onClick={handleToggleAvailability}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
                    isAvailable
                      ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                      : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
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
                value={
                  profile?.home?.latitude !== undefined && profile?.home?.longitude !== undefined
                    ? `📍 ${profile.home.latitude.toFixed(4)}, ${profile.home.longitude.toFixed(4)}`
                    : "Not set"
                }
              />
              <InfoRow
                label="Last Known Location"
                value={
                  profile?.lastKnownLocation?.latitude !== undefined && profile?.lastKnownLocation?.longitude !== undefined
                    ? `📍 ${profile.lastKnownLocation.latitude.toFixed(4)}, ${profile.lastKnownLocation.longitude.toFixed(4)}`
                    : "Not set"
                }
              />
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full mt-4 bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition"
            >
              Edit Profile Details
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow p-8 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold">Edit Driver Details</h2>
              <span className="text-xs text-gray-400">DTO: DriverUpdateDto</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Active City</label>
                <input
                  type="text"
                  value={form.activeCity}
                  onChange={(e) => setForm({ ...form, activeCity: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  placeholder="e.g. Vadodara"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">License Number</label>
                <input
                  type="text"
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  placeholder="e.g. DL-12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Aadhar Number</label>
                <input
                  type="text"
                  value={form.aadharNumber}
                  onChange={(e) => setForm({ ...form, aadharNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  placeholder="e.g. 1234 5678 9012"
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
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  placeholder="e.g. 4.9"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                    className="w-5 h-5 rounded text-black focus:ring-black border-gray-300"
                  />
                  <span className="text-sm font-semibold text-gray-800">Available for rides</span>
                </label>
              </div>
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
