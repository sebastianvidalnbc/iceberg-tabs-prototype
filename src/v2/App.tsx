// V2 workspace entry point. Placeholder shell for now; the four-region
// Explorer -> Preview -> Properties workspace is implemented in later steps.
// V1 is unaffected — this only mounts at #/v2.
export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--color-bg-canvas)",
        color: "var(--color-text-secondary)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ color: "var(--color-text-primary)", margin: 0 }}>Iceberg V2</h1>
        <p>Workspace shell coming next.</p>
      </div>
    </div>
  );
}
