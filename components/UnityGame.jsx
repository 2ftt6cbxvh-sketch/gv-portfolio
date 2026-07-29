"use client";
import { useEffect, useRef, useState } from "react";

// Loads a Unity WebGL build from /public/unity/<buildName>/Build/
// Expects files: {buildName}.loader.js, {buildName}.data(.br|.gz), {buildName}.framework.js(.br|.gz), {buildName}.wasm(.br|.gz)
export default function UnityGame({ buildName = "GameOfLife3D", title = "Conway's Game of Life — 3D" }) {
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

    let unityInstance;
    const script = document.createElement("script");
    script.src = loaderUrl;
    script.onload = () => {
      if (!window.createUnityInstance || !canvasRef.current) return;
      window
        .createUnityInstance(canvasRef.current, config, (p) => setProgress(Math.round(p * 100)))
        .then((instance) => {
          unityInstance = instance;
          setStatus("ready");
        })
        .catch(() => setStatus("error"));
    };
    script.onerror = () => setStatus("error");
    document.body.appendChild(script);

    return () => {
      if (unityInstance) unityInstance.Quit?.();
      document.body.removeChild(script);
    };
  }, [buildName, title]);

  return (
    <div className="unity-wrap" ref={containerRef}>
      {status !== "ready" && (
        <div className="unity-status">
          {status === "loading" && <span>Loading simulation… {progress}%</span>}
          {status === "error" && (
            <span>
              Could not load the build. Make sure files exist at <code>/public/unity/{buildName}/Build/</code>.
            </span>
          )}
        </div>
      )}
      <canvas ref={canvasRef} id="unity-canvas" className="unity-canvas" />
    </div>
  );
}
