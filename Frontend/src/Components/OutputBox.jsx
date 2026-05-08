import React from 'react';

const OutputBox = ({ output }) => {
  return (
    <div className="terminal">
      {output ? (
        <pre>{output}</pre>
      ) : (
        <div style={{ textAlign: "center", width: "100%" }}>
          <pre style={{ marginBottom: "5px" }}>Run your code to see output...</pre>
          <p style={{ fontSize: "0.85rem", color: "#888", margin: 0 }}>
            (press <b>Shift + Enter</b> to run the code)
          </p>
        </div>
      )}
    </div>
  );
};

export default OutputBox;