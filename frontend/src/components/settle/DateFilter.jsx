function getDateRange(label) {
  const now = new Date();
  if (label === "This Month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { label, start, end: null };
  }
  if (label === "Last Month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    return { label, start, end };
  }
  return { label: "All Time", start: null, end: null };
}

const OPTIONS = ["This Month", "Last Month", "All Time"];

export default function DateFilter({ dateRange, onDateRangeChange }) {
  return (
    <div className="date-filter" role="group" aria-label="Date filter">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          className={`date-filter-pill${dateRange.label === option ? " active" : ""}`}
          onClick={() => onDateRangeChange(getDateRange(option))}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
