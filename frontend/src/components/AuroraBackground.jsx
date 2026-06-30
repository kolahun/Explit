/**
 * StarBackground
 * Three tiny divs whose CSS box-shadow values create star fields.
 * Stars only appear in dark mode (controlled via CSS opacity).
 * Medium and large stars twinkle via CSS animation.
 */
export default function StarBackground() {
  return (
    <div className="star-bg" aria-hidden="true">
      <div className="star-sm" />
      <div className="star-md" />
      <div className="star-lg" />
    </div>
  );
}
