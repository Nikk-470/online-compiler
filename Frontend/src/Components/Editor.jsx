import Editor from "@monaco-editor/react";

const CodeEditor = ({ code, setCode, language, dark }) => {
  return (
    <div className="editor-wrapper">
      <Editor
  height="100%"
  width="100%"
  language={language}
  value={code}
  theme={dark ? "vs-dark" : "vs-light"}
  onChange={(value) => setCode(value)}
  options={{
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    scrollbar: {
      vertical: "hidden",
      horizontal: "hidden"
    }
  }}
/>
    </div>
  );
};

export default CodeEditor;