import { useEffect, useState } from "react";
import { getDriverProfile, updateDriverProfile } from "../../services/profileService";
import { toast } from "react-toastify";

export default function DriverProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ name: "", licenseNumber: "", activeCity: "", aadharNumber: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDriverProfile()
      .then((res) => {
        setProfile(res.data);
        setForm({
          name:          res.data.name || "",
          licenseNumber: res.data.licenseNumber || "",
          activeCity:    res.data.activeCity || "",
          aadharNumber:  res.data.aadharNumber || "",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDriverProfile(form);
      setProfile({ ...profile, ...form });
      setEditing(false);
      toast.success("Profile updated!");
    } catch { toast.error("Update failed"); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Driver Profile</h1>
        {!editing ? (
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">
                {profile?.name?.[0]?.toUpperCase() || "D"}
              </div>
              <div>
                <p className="text-xl font-bold">{profile?.name}</p>
                <p className="text-gray-500">{profile?.email}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${profile?.driverApprovalStatus === "APPROVED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {profile?.driverApprovalStatus || "PENDING"}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <InfoRow label="Phone"          value={profile?.phoneNumber} />
              <InfoRow label="License Number" value={profile?.licenseNumber} />
              <InfoRow label="Active City"    value={profile?.activeCity} />
              <InfoRow label="Aadhar Number"  value={profile?.aadharNumber} />
              <InfoRow label="Rating"         value={profile?.rating ? `⭐ ${profile.rating}` : "No rating yet"} />
              <InfoRow label="Available"      value={profile?.available ? "✅ Yes" : "❌ No"} />
            </div>
            <button onClick={() => setEditing(true)}
              className="w-full mt-6 bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow p-8 space-y-4">
            <h2 className="text-xl font-bold">Edit Profile</h2>
            {[
              ["name",          "Full Name"],
              ["licenseNumber", "License Number"],
              ["activeCity",    "Active City"],
              ["aadharNumber",  "Aadhar Number"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-semibold mb-1">{label}</label>
                <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-black text-white font-bold py-3 rounded-xl">Save</button>
              <button type="button" onClick={() => setEditing(false)} className="flex-1 bg-gray-100 text-black font-bold py-3 rounded-xl">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-3 border-b border-gray-100">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-semibold text-sm">{value || "—"}</span>
    </div>
  );
}
