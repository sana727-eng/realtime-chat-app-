function Spinner({ size = 20 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '2px solid #333',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }}
    />
  );
}

export default Spinner;