const spinStyle = `
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default function SpinnerLoader({ size = 20, color = "#3b82f6", thickness = 2 }) {
  return (
    <>
      <style>{spinStyle}</style>
      <span style={{
        width: size,
        height: size,
        border: `${thickness}px solid rgba(0,0,0,0.1)`,
        borderTopColor: color,
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.7s linear infinite",
      }} />
    </>
  );
}