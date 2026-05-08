const OutputBox = ({ output }) => {
  return (
    <div className="terminal">
      <pre>{output || "Run your code to see output..."}</pre>
    </div>
  );
};

export default OutputBox;