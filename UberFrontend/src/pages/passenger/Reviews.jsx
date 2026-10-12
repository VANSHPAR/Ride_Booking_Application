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
    <div className="min-h-screen bg-black text-gray-100 py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background ambient glowing blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] rounded-full bg-violet-700/15 blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-semibold text-gray-300 mb-2 backdrop-blur-sm">
              <span>⭐</span> Community Feedback
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Reviews</h1>
            <p className="text-gray-400 mt-1">Rate and review your rides</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY_FORM); }}
            className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-5 py-2.5 rounded-full font-semibold hover:opacity-90 transition shadow-lg shadow-violet-700/30 text-sm hover:scale-105"
          >
            {showForm ? "✕ Cancel" : "+ Add Review"}
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-900/70 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 mb-8 space-y-4">
            <h2 className="text-lg font-bold text-white">{editId ? "Edit Review" : "New Review"}</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Booking ID</label>
              <input
                type="number"
                required
                value={form.bookingId}
                onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
                className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 12"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Your Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Rating</label>
              <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Comment</label>
              <textarea
                required
                value={form.content}
                rows={3}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                placeholder="How was your ride?"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition shadow-lg shadow-violet-700/30"
            >
              {editId ? "Save Changes" : "Submit Review"}
            </button>
          </form>
        )}

        {/* Reviews list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-gray-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-12 text-center shadow-xl">
            <div className="text-6xl mb-4">⭐</div>
            <h2 className="text-xl font-bold text-white mb-2">No reviews yet</h2>
            <p className="text-gray-400">Be the first to leave a review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg p-5 hover:border-white/20 transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-white text-base">{r.name || "Anonymous"}</p>
                    <p className="text-xs text-cyan-400 font-mono">Booking #{r.booking}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(r)}
                      className="text-xs bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10 px-3 py-1 rounded-full transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 px-3 py-1 rounded-full transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <StarRating value={r.rating} readOnly />
                <p className="text-gray-300 text-sm mt-2 leading-relaxed">{r.content}</p>
                {r.createdAt && (
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
