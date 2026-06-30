/**
 * StarBackground
 * Fixed star field rendered only in dark mode (opacity: 0 in light, 1 in dark via CSS).
 * Three layers: small (1px), medium (1.5px), large (2px).
 * Stars are computed once at module load time — zero runtime cost in React renders.
 * Medium & large layers have a gentle twinkle animation via CSS.
 * Accessibility: twinkle pauses under prefers-reduced-motion.
 */

// Deterministic pseudo-random star positions computed once at module load
function generateStars(count, seed) {
  return Array.from({ length: count }, (_, i) => {
    const x = Math.round(Math.abs(Math.sin((i + seed) * 567.31 + 1.7)) * 2400);
    const y = Math.round(Math.abs(Math.cos((i + seed) * 234.73 + 2.3)) * 1200);
    const op = (0.22 + Math.abs(Math.sin((i + seed) * 89.17)) * 0.48).toFixed(2);
    return `${x}px ${y}px 0 0 rgba(255,255,255,${op})`;
  }).join(", ");
}

const SM_STARS = generateStars(120, 0);
const MD_STARS = generateStars(50, 200);
const LG_STARS = generateStars(14, 400);

export default function StarBackground() {
  return (
    <div className="star-bg" aria-hidden="true">
      <div className="star-layer star-sm" style={{ "--stars": `"${SM_STARS}"` }}>
        <span style={{ position: "absolute", width: 1, height: 1, boxShadow: SM_STARS }} />
      </div>
      <div className="star-layer star-md">
        <span style={{ position: "absolute", width: 1.5, height: 1.5, borderRadius: "50%", boxShadow: MD_STARS }} />
      </div>
      <div className="star-layer star-lg">
        <span style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", boxShadow: LG_STARS }} />
      </div>
    </div>
  );
}
