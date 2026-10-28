export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-container" role="status">
      <div className="loading-spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}