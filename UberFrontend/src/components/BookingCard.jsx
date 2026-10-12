const STATUS_STYLES = {
  ASSIGNING_DRIVER: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  SCHEDULED:        "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  IN_PROGRESS:      "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  COMPLETED:        "bg-violet-500/20 text-violet-300 border-violet-500/30",
  CANCELLED:        "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function BookingCard({ booking }) {
  const statusClass = STATUS_STYLES[booking.bookingStatus] || "bg-gray-800 text-gray-300 border-white/10";
  return (
    <div className="bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg hover:border-white/20 transition">
      <div className="flex justify-between items-start mb-3">
        <span className="text-lg font-bold text-white flex items-center gap-2">
          <span>🌊</span>
          <span>Booking #{booking.bookingId}</span>
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
          {booking.bookingStatus}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-300">
        {booking.startLocation && (
          <p className="flex items-center gap-1.5">
            <span>📍</span>
            <span className="text-gray-400">Start:</span>
            <span className="font-mono text-cyan-300">{booking.startLocation.latitude?.toFixed(4)}, {booking.startLocation.longitude?.toFixed(4)}</span>
          </p>
        )}
        {booking.endLocation && (
          <p className="flex items-center gap-1.5">
            <span>🏁</span>
            <span className="text-gray-400">End:</span>
            <span className="font-mono text-violet-300">{booking.endLocation.latitude?.toFixed(4)}, {booking.endLocation.longitude?.toFixed(4)}</span>
          </p>
        )}
        {booking.driverId && (
          <p className="flex items-center gap-1.5">
            <span>🛞</span>
            <span className="text-gray-400">Driver ID:</span>
            <span className="font-bold text-white">#{booking.driverId}</span>
          </p>
        )}
        {booking.passengerId && (
          <p className="flex items-center gap-1.5">
            <span>👤</span>
            <span className="text-gray-400">Passenger ID:</span>
            <span className="font-bold text-white">#{booking.passengerId}</span>
          </p>
        )}
        {booking.totalDistance && (
          <p className="flex items-center gap-1.5">
            <span>📏</span>
            <span className="text-gray-400">Distance:</span>
            <span className="font-bold text-emerald-400">{booking.totalDistance} km</span>
          </p>
        )}
        {booking.startTime && (
          <p className="flex items-center gap-1.5">
            <span>🕐</span>
            <span className="text-gray-400">Start:</span>
            <span>{new Date(booking.startTime).toLocaleString()}</span>
          </p>
        )}
        {booking.endTime && (
          <p className="flex items-center gap-1.5">
            <span>🕑</span>
            <span className="text-gray-400">End:</span>
            <span>{new Date(booking.endTime).toLocaleString()}</span>
          </p>
        )}
      </div>
    </div>
  );
}
