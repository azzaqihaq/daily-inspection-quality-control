import "@css/load-spinner.css";

const LoadSpinner = (props) => {
  return (
    <div className="wrapper" {...props}>
      <h1>Daily Inspection Quality Control</h1>
      <div className="spinner"></div>
      <p>{props.children}</p>
    </div>
  );
};

export default LoadSpinner;
