import { useEffect, useState } from "react";
import { getPassengerProfile, updatePassengerProfile } from "../../services/profileService";
import { toast } from "react-toastify";

export default function PassengerProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ name: "", rating: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPassengerProfile()
      .then((res) => { setProfile(res.data); setForm({ name: res.data.name || "", rating: res.data.rating || "" }); })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updatePassengerProfile(form);
      setProfile({ ...profile, ...form });
      setEditing(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        {!editing ? (
          <div className="bg-white rounded-2xl shadow p-8 space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">
                {profile?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-xl font-bold">{profile?.name}</p>
                <p className="text-gray-500">{profile?.email}</p>
              </div>
            </div>
            <InfoRow label="Phone"  value={profile?.phoneNumber} />
            <InfoRow label="Rating" value={profile?.rating ? `⭐ ${profile.rating}` : "No rating yet"} />
            <InfoRow label="Role"   value={profile?.role} />
            <button onClick={() => setEditing(true)}
              className="w-full mt-4 bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow p-8 space-y-5">
            <h2 className="text-xl font-bold">Edit Profile</h2>
            <div>
              <label className="block text-sm font-semibold mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="flex gap-3">
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
