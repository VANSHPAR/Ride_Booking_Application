export default function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange?.(star)}
          className={`text-2xl transition ${
            star <= value ? "text-yellow-400" : "text-gray-300"
          } ${!readOnly ? "hover:text-yellow-300 cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
