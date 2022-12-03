export default function LoadingSpinner() {
  return (
    <div
      style={{
        backgroundColor: "rgba(0,0,0,0.86)",
        width: "100vw",
        height: "100vh",
        position: "fixed",
        zIndex: 99,
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        top: 0,
        left: 0,
      }}
    >
      <p style={{ color: "white" }}>Pasandonos de verga...</p>
      <div className="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
