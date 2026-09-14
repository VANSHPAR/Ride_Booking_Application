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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-1">My Bookings</h1>
        <p className="text-gray-500 mb-8">All your ride history</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-xl font-bold mb-2">No rides yet</h2>
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
