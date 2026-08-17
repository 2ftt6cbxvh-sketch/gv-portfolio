"use client";
import { useEffect, useRef, useState } from "react";

// Loads a Unity WebGL build from /public/unity/<buildName>/Build/
export default function UnityGame({ buildName = "GameOfLife3D1", title = "Conway's Game of Life — 3D" }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const buildUrl = `/unity/${buildName}/Build`;
    const loaderUrl = `${buildUrl}/${buildName}.loader.js`;
    const config = {
      dataUrl: `${buildUrl}/${buildName}.data`,
      frameworkUrl: `${buildUrl}/${buildName}.framework.js`,
      codeUrl: `${buildUrl}/${buildName}.wasm`,
      streamingAssetsUrl: "StreamingAssets",
      companyName: "Ganesh Varma",
      productName: title,
      productVersion: "1.0",
    };

    let unityInstance = null;
    let isMounted = true;

    const script = document.createElement("script");
    script.src = loaderUrl;
    script.async = true;
    script.onload = () => {
      if (!isMounted || !window.createUnityInstance || !canvasRef.current) return;
      window
        .createUnityInstance(canvasRef.current, config, (p) => {
          if (isMounted) {
            setProgress(Math.round(p * 100));
          }
        })
        .then((instance) => {
          if (isMounted) {
            unityInstance = instance;
            setStatus("ready");
            setProgress(100);
          } else {
            instance.Quit?.();
          }
        })
        .catch((err) => {
          console.error("Unity WebGL loading error:", err);
          if (isMounted) setStatus("error");
        });
    };
    script.onerror = () => {
      if (isMounted) setStatus("error");
    };
    document.body.appendChild(script);

    return () => {
      isMounted = false;
      if (unityInstance) {
        try {
          unityInstance.Quit?.();
        } catch (e) {}
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [buildName, title]);

  return (
    <div className="unity-wrap" ref={containerRef}>
      {status !== "ready" && (
        <div
          className="unity-status"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            background: "#000000",
          }}
        >
          {status === "loading" && (
            <>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.95rem",
                  color: "var(--color-accent, #39ff88)",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                {progress < 90
                  ? `Loading simulation assets... ${progress}%`
                  : progress < 100
                  ? `Initializing 3D WebGL Engine... ${progress}%`
                  : `Starting 3D World... 100%`}
              </div>

              {/* High-tech cyberpunk loading bar */}
              <div
                style={{
                  width: "min(320px, 80%)",
                  height: "5px",
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "999px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(5, progress)}%`,
                    height: "100%",
                    background: "var(--color-accent, #39ff88)",
                    boxShadow: "0 0 12px var(--color-accent, #39ff88)",
                    transition: "width 0.25s ease-out",
                  }}
                />
              </div>
            </>
          )}
          {status === "error" && (
            <span style={{ color: "#ff4466", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
              Could not load the 3D simulation. Please make sure WebGL2 is supported and hardware acceleration is enabled in your browser.
            </span>
          )}
        </div>
      )}
      <canvas
        ref={canvasRef}
        id="unity-canvas"
        className="unity-canvas"
        tabIndex={-1}
        style={{
          width: "100%",
          height: "100%",
          display: status === "ready" ? "block" : "none",
        }}
      />
    </div>
  );
}
