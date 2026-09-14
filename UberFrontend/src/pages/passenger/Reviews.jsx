import { useEffect, useState } from "react";
import { getAllReviews, createReview, updateReview, deleteReview } from "../../services/reviewService";
import StarRating from "../../components/StarRating";
import { toast } from "react-toastify";

const EMPTY_FORM = { content: "", name: "", bookingId: "", rating: 5 };

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [editId, setEditId]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    getAllReviews()
      .then((r) => setReviews(r.data || []))
      .catch(() => toast.error("Failed to load reviews"))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateReview(editId, form);
        toast.success("Review updated!");
      } else {
        await createReview({ ...form, bookingId: Number(form.bookingId) });
        toast.success("Review submitted!");
      }
      setForm(EMPTY_FORM); setEditId(null); setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data || "Failed to save review");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReview(id);
      toast.success("Deleted!");
      load();
    } catch { toast.error("Delete failed"); }
  };

  const startEdit = (r) => {
    setForm({ content: r.content, name: r.name || "", bookingId: r.booking || "", rating: r.rating });
    setEditId(r.id);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Reviews</h1>
            <p className="text-gray-500">Rate and review your rides</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY_FORM); }}
            className="bg-black text-white px-5 py-2 rounded-full font-semibold hover:bg-gray-800 transition">
            {showForm ? "✕ Cancel" : "+ Add Review"}
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 mb-6 space-y-4">
            <h2 className="text-lg font-bold">{editId ? "Edit Review" : "New Review"}</h2>
            <div>
              <label className="block text-sm font-semibold mb-1">Booking ID</label>
              <input type="number" required value={form.bookingId}
                onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g. 12" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Your Name</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Rating</label>
              <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Comment</label>
              <textarea required value={form.content} rows={3}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                placeholder="How was your ride?" />
            </div>
            <button type="submit"
              className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">
              {editId ? "Save Changes" : "Submit Review"}
            </button>
          </form>
        )}

        {/* Reviews list */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <h2 className="text-xl font-bold mb-2">No reviews yet</h2>
            <p className="text-gray-400">Be the first to leave a review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl shadow p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{r.name || "Anonymous"}</p>
                    <p className="text-xs text-gray-400">Booking #{r.booking}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(r)} className="text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition">Delete</button>
                  </div>
                </div>
                <StarRating value={r.rating} readOnly />
                <p className="text-gray-600 text-sm mt-2">{r.content}</p>
                {r.createdAt && <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
