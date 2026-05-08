import { useState, useEffect } from "react"; // 🆕 Added useEffect here
import "./App.css";

import CodeEditor from "./Components/Editor";
import LanguageSelector from "./Components/LanguageSelector";
import RunButton from "./Components/RunButton";
import OutputBox from "./Components/OutputBox";
import { getAIReview } from "./api";
import ReactMarkdown from "react-markdown";

function App() {
  const defaultCPP = `// Online C++ compiler to run C++ program online\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write C++ code here\n    \n}`;

  const defaultJava = `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}`;
  
  const defaultC = `#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}`;
  
  const [files, setFiles] = useState([
    { name: "main.cpp", language: "cpp", code: defaultCPP }
  ]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [output, setOutput] = useState("");
  const [dark, setDark] = useState(false);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [topHeight, setTopHeight] = useState(0.5);

  const activeFile = files[activeIndex] || files[0];

  /* ================= SHORTCUT LOGIC ================= */
  // 🆕 This block listens for Shift + Enter and clicks the Run button
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.key === "Enter") {
        e.preventDefault(); // Stop a new line from being created
        // Look for the Run Button by its class or text content
        const runBtn = document.querySelector(".run-btn"); 
        if (runBtn) {
          runBtn.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const updateCode = (newCode) => {
    const updated = [...files];
    if (updated[activeIndex]) {
      updated[activeIndex].code = newCode;
      setFiles(updated);
    }
  };

  const changeLanguage = (lang) => {
    const updated = [...files];
    if (!updated[activeIndex]) return;
    updated[activeIndex].language = lang;
    if (lang === "cpp") {
      updated[activeIndex].code = defaultCPP;
      updated[activeIndex].name = "main.cpp";
    } else if (lang === "python") {
      updated[activeIndex].code = `# Python code\nprint("Hello World")`;
      updated[activeIndex].name = "main.py";
    } else if (lang === "java") { 
      updated[activeIndex].code = defaultJava;
      updated[activeIndex].name = "Main.java";
    } 
    else if (lang === "c") {
      updated[activeIndex].code = defaultC;
      updated[activeIndex].name = "main.c";
    }
    setFiles(updated);
  };

  const handleAISuggestion = async () => {
    setMessages([]);
    try {
      const res = await getAIReview(activeFile.code);
      setMessages([{ role: "assistant", content: res }]);
    } catch (err) {
      setMessages([{ role: "assistant", content: "Failed to get AI suggestion." }]);
    }
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;
    const userMsg = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    const recentMessages = messages.slice(-4);
    const finalMessages = [
      {
        role: "system",
        content: `You are helping the user with THIS ${activeFile.language} code:\n\n${activeFile.code}\n\nRules: Answer clearly, be concise, and explain beginner-friendly.`
      },
      ...recentMessages,
      userMsg
    ];

    try {
      const res = await getAIReview(finalMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: res }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "AI error occurred." }]);
    }
    setPrompt("");
  };

  const startResize = (e) => {
    e.preventDefault();
    const onMouseMove = (event) => {
      const container = document.querySelector(".right");
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newHeight = (event.clientY - rect.top) / rect.height;
      if (newHeight > 0.1 && newHeight < 0.9) setTopHeight(newHeight);
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className={dark ? "app dark" : "app light"}>
      <div className="header">
        <div className="logo">
          <span className="logo-icon">🤖</span>
          <span className="logo-text">CodeAI</span>
        </div>
        <div className="header-right">
          <LanguageSelector language={activeFile.language} setLanguage={changeLanguage} />
          <button className="theme-btn" onClick={() => setDark(!dark)}>
            {dark ? "🔆" : "🌙"}
          </button>
        </div>
      </div>

      <div className="main">
        <div className="left">
          <div className="tab-bar">
            {files.map((file, index) => (
              <div key={index} className={`tab ${index === activeIndex ? "active" : ""}`} onClick={() => setActiveIndex(index)}>
                {file.name}
                <span className="close-tab" onClick={(e) => {
                  e.stopPropagation();

                  if (files.length === 1) {
                    const lastFile = files[0];
                    let resetCode = "";
                    if (lastFile.language === "python") {
                      resetCode = `# Python code\nprint("Hello World")`;
                    } else if (lastFile.language === "cpp") {
                      resetCode = defaultCPP;
                    } else if (lastFile.language === "java") {
                      resetCode = defaultJava;
                    }
                    else if (lastFile.language === "c") {
                      resetCode = defaultC;
                    }
                    setFiles([{ 
                      name: lastFile.name, 
                      language: lastFile.language, 
                      code: resetCode 
                    }]);
                    setActiveIndex(0);
                    return;
                  }

                  const updated = files.filter((_, i) => i !== index);
                  setFiles(updated);
                  
                  if (index <= activeIndex) {
                    setActiveIndex(Math.max(0, activeIndex - 1));
                  }
                }}>✖</span>
              </div>
            ))}
            <button className="add-tab" onClick={() => {
               const newFile = { name: `file${files.length + 1}.cpp`, language: "cpp", code: defaultCPP };
               setFiles([...files, newFile]);
               setActiveIndex(files.length);
            }}>+</button>
          </div>

          <CodeEditor code={activeFile.code} setCode={updateCode} language={activeFile.language} dark={dark} />

          <div className="toolbar">
            {/* 🛡️ IMPORTANT: Pass the class "run-btn" to your component */}
            <RunButton 
              className="run-btn" 
              code={activeFile.code} 
              language={activeFile.language} 
              setOutput={setOutput} 
              isCompiling={isCompiling} 
              setIsCompiling={setIsCompiling} 
            />
            <button className="ai-btn" onClick={handleAISuggestion}>AI Suggestion</button>
          </div>
        </div>

        <div className="right">
          <div className="output-panel" style={{ flex: topHeight }}>
            <div className="panel-header">
              <div className="output-title"><span>Output</span><button onClick={() => setOutput("")}>Clear</button></div>
            </div>
            <OutputBox output={output} />
          </div>

          <div className="resizer" onMouseDown={startResize}></div>

          <div className="ai-panel" style={{ flex: 1 - topHeight }}>
            <div className="panel-header"><span>AI Suggestion</span></div>
            <div className="ai-chat">
              <div className="chat-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`msg ${msg.role}`}>
                    <ReactMarkdown
                      components={{
                        pre: ({ children }) => {
                          const codeText = children.props.children;
                          return (
                            <div className="code-container">
                              <button className="copy-btn" onClick={() => copyToClipboard(codeText)}>
                                📋 COPY
                              </button>
                              <pre>{children}</pre>
                            </div>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask AI anything..." />
                <button onClick={handleSend}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;