import { useEffect, useState } from "react";
import { getMyBookings } from "../../services/bookingService";
import BookingCard from "../../components/BookingCard";
import { toast } from "react-toastify";

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getMyBookings()
      .then((res) => setBookings(res.data || []))
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-100 py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background ambient glowing blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] rounded-full bg-violet-700/15 blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-semibold text-gray-300 mb-2 backdrop-blur-sm">
            <span>📜</span> History
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Bookings</h1>
          <p className="text-gray-400 mt-1">All your past and ongoing rides</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-gray-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-12 text-center shadow-xl">
            <div className="text-6xl mb-4">🌊</div>
            <h2 className="text-xl font-bold text-white mb-2">No rides yet</h2>
            <p className="text-gray-400">Your past rides will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => <BookingCard key={b.bookingId} booking={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}
