/**
 * AuroraBackground
 * Fixed behind all content. Pure CSS animation — no JS, no canvas, no interactivity.
 * Pauses automatically under prefers-reduced-motion.
 */
export default function AuroraBackground() {
  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
    </div>
  );
}
