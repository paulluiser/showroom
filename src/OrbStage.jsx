export default function OrbStage({ id, kind, caption, children }) {
  return <div className={`chapter-art chapter-art--${kind}`}>
    <div className="chapter-orb-slot" id={id} aria-hidden="true">
      <div className="orb-ground" />
      <div className="orb-trace orb-trace--a" />
      <div className="orb-trace orb-trace--b" />
    </div>
    {caption && <p className="orb-caption">{caption}</p>}
    {children}
  </div>;
}
