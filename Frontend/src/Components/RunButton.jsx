import React from 'react';
import { runCode } from '../api'; // Ensure the path to your api.js is correct

const RunButton = ({ code, language, setOutput, isCompiling, setIsCompiling }) => {
  
  const handleRun = async () => {
    if (isCompiling) return; // Prevent overlapping requests

    setIsCompiling(true);
    try {
      // Calls the runCode function from your api.js
      const result = await runCode(code, language);
      setOutput(result);
    } catch (error) {
      setOutput("Execution Error: " + error.message);
    } finally {
      setIsCompiling(false); // Re-enable button
    }
  };

  return (
    <button 
      className="run-btn" 
      onClick={handleRun} 
      disabled={isCompiling}
    >
      {isCompiling ? (
        <>
          <span className="spinner"></span>
          Compiling...
        </>
      ) : (
        "Run"
      )}
    </button>
  );
};

// CRITICAL: This line fixes the "does not provide an export named 'default'" error
export default RunButton;