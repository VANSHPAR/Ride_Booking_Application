const STATUS_COLORS = {
  ASSIGNING_DRIVER: "bg-yellow-100 text-yellow-800",
  SCHEDULED:        "bg-blue-100 text-blue-800",
  IN_PROGRESS:      "bg-green-100 text-green-800",
  COMPLETED:        "bg-gray-100 text-gray-700",
  CANCELLED:        "bg-red-100 text-red-700",
};

export default function BookingCard({ booking }) {
  const colorClass = STATUS_COLORS[booking.bookingStatus] || "bg-gray-100 text-gray-700";
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <span className="text-lg font-bold text-gray-900">Booking #{booking.bookingId}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
          {booking.bookingStatus}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        {booking.startLocation && (
          <p>📍 Start: {booking.startLocation.latitude?.toFixed(4)}, {booking.startLocation.longitude?.toFixed(4)}</p>
        )}
        {booking.endLocation && (
          <p>🏁 End: {booking.endLocation.latitude?.toFixed(4)}, {booking.endLocation.longitude?.toFixed(4)}</p>
        )}
        {booking.driverId && <p>🚗 Driver ID: {booking.driverId}</p>}
        {booking.totalDistance && <p>📏 Distance: {booking.totalDistance} km</p>}
        {booking.startTime && <p>🕐 Start: {new Date(booking.startTime).toLocaleString()}</p>}
        {booking.endTime   && <p>🕑 End: {new Date(booking.endTime).toLocaleString()}</p>}
      </div>
    </div>
  );
}
