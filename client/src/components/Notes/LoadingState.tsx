export default function LoadingState() {
  return (
    <div className="notes-grid">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="card skeleton skeleton-card" key={index}>
          <div className="skeleton skeleton-line skeleton-line-md"></div>
          <div className="skeleton skeleton-line skeleton-line-sm"></div>
          <div className="skeleton skeleton-line skeleton-line-lg"></div>
          <div className="skeleton skeleton-line skeleton-line-lg"></div>
          <div className="skeleton skeleton-line skeleton-line-md"></div>
        </div>
      ))}
    </div>
  );
}
