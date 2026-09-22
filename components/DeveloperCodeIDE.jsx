"use client";

import { useState, useRef, useEffect } from "react";

const SYSTEM_HEADER = `
  ______   _______  ______  ___  ___ _____  _   _ 
 / ___\\ \\ / /  ___| | ___ \\/ _ \\ |  \\/  | /  | | | |
| |  _ \\ V /| |____ | |_/ / /_\\ \\| .  . |/ /| | | |
| | | | \\ / |  ___| |  __/|  _  || |\\/| / /_| | | |
| |_| | | | | |____ | |   | | | || |  | \\___  |_| |
 \\____| \\_/ \\____/  \\_|   \\_| |_/\\_|  |_/   |_(_)_|
                                                   
Type 'help' or click quick commands below to explore.
`;

const QUICK_COMMANDS = ["help", "whoami", "skills", "projects", "education", "contact", "matrix", "clear"];

export default function DeveloperCodeIDE() {
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [logs, setLogs] = useState([
    { type: "system", text: SYSTEM_HEADER },
    { type: "info", text: "Connected to ganeshvarma.in [Session: v5.0.9]\nType 'help' to see available terminal commands." }
  ]);

  const terminalBodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommand = (cmdStr) => {
    const raw = cmdStr.trim();
    if (!raw) return;

    const lower = raw.toLowerCase();
    setCmdHistory((prev) => [...prev, raw]);
    setHistoryIndex(-1);

    const newLogs = [...logs, { type: "user", text: `$ ${raw}` }];

    switch (lower) {
      case "help":
        newLogs.push({
          type: "output",
          text: `AVAILABLE COMMANDS:
  whoami    - Brief overview & bio
  skills    - Engineering stack & proficiency
  projects  - Featured full-stack & ML projects
  education - Academic credentials & degree
  contact   - Direct email & social profiles
  matrix    - Trigger digital cyberpunk matrix stream
  clear     - Clear terminal buffer`
        });
        break;

      case "whoami":
        newLogs.push({
          type: "output",
          text: `GANESH VARMA // Software Developer & Data Analyst
------------------------------------------------
• Candidate: MSc Advanced Data Science & AI (University of Liverpool)
• Stack: Full-Stack React/Next.js, Node.js, Python PyTorch, C++
• Focus: High-performance web applications, ML models, & interactive systems.
• Location: Vijayawada, Andhra Pradesh, IN / Liverpool, UK`
        });
        break;

      case "skills":
        newLogs.push({
          type: "output",
          text: `CORE TECHNICAL STACK:
------------------------------------------------
[Frontend]  React, Next.js, TypeScript, GSAP, CSS3      [92%] ████████████████░░
[Backend]   Node.js, Express, Python FastAPI, REST APIs  [88%] ██████████████░░░░
[Database]  PostgreSQL, MongoDB, SQL Optimization       [85%] █████████████░░░░░
[Systems]   C++, Unity 3D, C#, Python PyTorch ML         [80%] ████████████░░░░░░`
        });
        break;

      case "projects":
        newLogs.push({
          type: "output",
          text: `FEATURED PROJECTS:
------------------------------------------------
01. FarmFreshFarmer
    • Full-stack agritech platform (Node.js, React, PostgreSQL)
02. Conway's Game of Life 3D
    • Interactive 3D cellular automata (Unity, C#, GPU Instancing)
03. AI-Assisted Project Pipeline
    • Generative AI content & automated workflow pipeline (Python)
04. Interactive Portfolio (This site!)
    • Next.js 15 App Router, GSAP motion system, PostgreSQL admin`
        });
        break;

      case "education":
        newLogs.push({
          type: "output",
          text: `ACADEMIC BACKGROUND:
------------------------------------------------
🎓 MSc Advanced Computer Science / Data Science & AI
   • University of Liverpool (2024 - 2026)
🎓 Bachelor of Technology (B.Tech)
   • Organised 8 national-level fest events`
        });
        break;

      case "contact":
        newLogs.push({
          type: "output",
          text: `DIRECT CONTACT:
------------------------------------------------
📧 Email:    gp61080@gmail.com
💻 GitHub:   github.com/2ftt6cbxvh-sketch
💼 LinkedIn: linkedin.com/in/ganeshvarma`
        });
        break;

      case "matrix":
        newLogs.push({
          type: "matrix",
          text: `01000111 01000001 01001110 01000101 01010011 01001000\nWAKE UP, NEO... THE MATRIX HAS YOU.\n10101010 11001100 00110011 11110000 01010101`
        });
        break;

      case "clear":
        setLogs([]);
        setInput("");
        return;

      default:
        newLogs.push({
          type: "error",
          text: `zsh: command not found: ${raw}. Type 'help' for available commands.`
        });
        break;
    }

    setLogs(newLogs);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx < cmdHistory.length) {
        setHistoryIndex(nextIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  return (
    <div
      className="cli-terminal-window"
      onClick={() => inputRef.current?.focus()}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "'Fira Code', 'Courier New', monospace",
        margin: "24px 0",
      }}
    >
      {/* Terminal Titlebar */}
      <div
        className="cli-terminal-titlebar"
        style={{
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f56", display: "inline-block" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e", display: "inline-block" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#27c93f", display: "inline-block" }} />
          <span className="cli-terminal-title" style={{ fontSize: "0.78rem", marginLeft: 8 }}>
            guest@ganeshvarma.in ~ zsh (interactive CLI)
          </span>
        </div>
        <div className="cli-terminal-version" style={{ fontSize: "0.72rem" }}>
          CLI v5.0.9
        </div>
      </div>

      {/* Quick Command Suggestion Chips */}
      <div
        className="cli-terminal-chips-bar"
        style={{
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span className="cli-terminal-quick-label" style={{ fontSize: "0.72rem" }}>Quick Run:</span>
        {QUICK_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            onClick={(e) => {
              e.stopPropagation();
              handleCommand(cmd);
            }}
            className="cli-terminal-chip"
            style={{
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: "0.75rem",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
            }}
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Output Area */}
      <div
        ref={terminalBodyRef}
        className="cli-terminal-body"
        style={{
          padding: 16,
          maxHeight: 360,
          overflowY: "auto",
          fontSize: "0.84rem",
          lineHeight: 1.5,
        }}
      >
        {logs.map((log, idx) => (
          <div key={idx} style={{ marginBottom: 8, whiteSpace: "pre-wrap" }}>
            {log.type === "user" && <span className="cli-log-user">{log.text}</span>}
            {log.type === "system" && <span className="cli-log-system">{log.text}</span>}
            {log.type === "info" && <span className="cli-log-info">{log.text}</span>}
            {log.type === "output" && <span className="cli-log-output">{log.text}</span>}
            {log.type === "matrix" && (
              <span className="cli-log-matrix">
                {log.text}
              </span>
            )}
            {log.type === "error" && <span className="cli-log-error">{log.text}</span>}
          </div>
        ))}

        {/* Input Prompt Row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <span className="cli-prompt">guest@gv:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type command ('help', 'skills', 'projects')..."
            className="cli-input"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "inherit",
              fontSize: "0.84rem",
            }}
          />
        </div>
      </div>
    </div>
  );
}
