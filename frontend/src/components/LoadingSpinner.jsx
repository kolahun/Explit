export default function LoadingSpinner({ size = "md", text = null, fullPage = false }) {
  const sizes = {
    sm: { ring: 20, border: 2 },
    md: { ring: 36, border: 3 },
    lg: { ring: 56, border: 4 },
  };
  const { ring, border } = sizes[size] || sizes.md;

  const spinner = (
    <div
      style={{
        width: ring,
        height: ring,
        borderRadius: "50%",
        border: `${border}px solid var(--border-color)`,
        borderTopColor: "var(--color-primary)",
        animation: "spin 0.7s linear infinite",
        flexShrink: 0,
      }}
      role="status"
      aria-label={text || "Loading"}
    />
  );

  if (fullPage) {
    return (
      <div className="loading-fullpage">
        {spinner}
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }

  if (text) {
    return (
      <div className="loading-inline">
        {spinner}
        <span className="loading-text">{text}</span>
      </div>
    );
  }

  return spinner;
}
