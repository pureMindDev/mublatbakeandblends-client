import "./Loader.css";

function Loader({ message = "Loading…" }) {
  return (
    <div className="loader-wrapper">
      <div className="loader-ring">
        <div /><div /><div /><div />
      </div>
      <p className="loader-text">{message}</p>
    </div>
  );
}

export default Loader;