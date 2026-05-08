require("dotenv").config();

const express = require("express");
// const cors = require("cors"); // Commented out: Nginx handles CORS for DuckDNS
const { exec } = require("child_process");
const rateLimit = require("express-rate-limit"); 
const fs = require("fs");
const path = require("path");
const { getSuggestion } = require("./AI/aiService");

const app = express();

// app.use(cors()); // Commented out to avoid duplicate header errors with Nginx
app.use(express.json());

/* ================= RATE LIMITING (SECURITY) ================= */

const runLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 10, 
  message: "Too many code executions. Please wait a minute.",
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 15, 
  message: "Too many AI requests. Please wait a minute.",
  standardHeaders: true,
  legacyHeaders: false,
});

/* ================= RUN CODE (DOCKER SAFE) ================= */

app.post("/run", runLimiter, (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).send("Code and language required");
  }

  const internalWorkDir = process.cwd(); 
  const externalHostDir = process.env.HOST_PROJECT_PATH || internalWorkDir;

  // 🛡️ Essential Security: No Network, Memory/CPU limits
  const securityFlags = `--rm --network none --memory="128m" --cpus=".5" --pids-limit 10`;

  // ================= PYTHON =================
  if (language === "python") {
    const fileName = `code_${Date.now()}.py`;
    const filePath = path.join(internalWorkDir, fileName);
    fs.writeFileSync(filePath, code);

    const command = `docker run ${securityFlags} -v "${externalHostDir}:/app" -w /app python:3.10 sh -c "timeout 5s python ${fileName}"`;
    
    exec(command, { timeout: 5500 }, (error, stdout, stderr) => {
      try { fs.unlinkSync(filePath); } catch {}
      if (error) return res.send(stderr || error.message);
      res.send(stdout || "No output");
    });
  }

  // ================= C++ =================
  else if (language === "cpp") {
    const timestamp = Date.now();
    const fileName = `code_${timestamp}.cpp`;
    const exeName = `code_${timestamp}`;
    const filePath = path.join(internalWorkDir, fileName);
    fs.writeFileSync(filePath, code);

    const command = `docker run ${securityFlags} -v "${externalHostDir}:/app" -w /app gcc:latest sh -c "timeout 5s g++ ${fileName} -o ${exeName} && timeout 5s ./${exeName}"`;

    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      try {
        fs.unlinkSync(filePath);
        fs.unlinkSync(path.join(internalWorkDir, exeName));
      } catch {}
      if (error) return res.send(stderr || error.message);
      res.send(stdout || "No output");
    });
  }

  // ================= C =================
  else if (language === "c") {
    const timestamp = Date.now();
    const fileName = `code_${timestamp}.c`;
    const exeName = `code_${timestamp}`;
    const filePath = path.join(internalWorkDir, fileName);
    fs.writeFileSync(filePath, code);

    const command = `docker run ${securityFlags} -v "${externalHostDir}:/app" -w /app gcc:latest sh -c "timeout 5s gcc ${fileName} -o ${exeName} && timeout 5s ./${exeName}"`;

    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      try {
        fs.unlinkSync(filePath);
        fs.unlinkSync(path.join(internalWorkDir, exeName));
      } catch {}
      if (error) return res.send(stderr || error.message);
      res.send(stdout || "No output");
    });
  }

  // ================= JAVA =================
  else if (language === "java") {
    const fileName = "Main.java"; 
    const filePath = path.join(internalWorkDir, fileName);
    fs.writeFileSync(filePath, code);

    const command = `docker run ${securityFlags} -v "${externalHostDir}:/app" -w /app eclipse-temurin:17-jdk sh -c "timeout 10s javac ${fileName} && timeout 5s java Main"`;

    exec(command, { timeout: 15000 }, (error, stdout, stderr) => {
      try {
        fs.unlinkSync(filePath);
        fs.unlinkSync(path.join(internalWorkDir, "Main.class"));
      } catch {}
      if (error) return res.send(stderr || error.message);
      res.send(stdout || "No output");
    });
  }

  else {
    return res.status(400).send("Unsupported language");
  }
});

/* ================= AI ROUTE (SMART) ================= */

app.post("/ai", aiLimiter, async (req, res) => {
  try {
    const { messages, code } = req.body;
    let finalMessages = [];

    if (Array.isArray(code)) {
      finalMessages = code;
    } 
    else if (messages && Array.isArray(messages)) {
      finalMessages = messages;
    } 
    else if (code) {
      finalMessages = [
        {
          role: "user",
          content: `Analyze this ${req.body.language || 'code'} and suggest improvements:\n\n${code}`
        }
      ];
    }

    if (!finalMessages || finalMessages.length === 0) {
      return res.status(400).send("No input provided");
    }

    if (JSON.stringify(finalMessages).length > 10000) {
      return res.status(400).send("Input too large");
    }

    const timeout = (ms) =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI request timeout")), ms)
      );

    const response = await Promise.race([
      getSuggestion(finalMessages),
      timeout(15000)
    ]);

    res.send(response);

  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ error: "AI failed", details: err.message });
  }
});

/* ================= SERVER ================= */

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});