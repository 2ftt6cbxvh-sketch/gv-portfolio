"use client";

/**
 * Editor Audio Wave Equalizer Visualizer.
 * Renders animated vertical equalizer bars in editor accent color.
 */
export default function EditorAudioWave({ accent = "#a56ce8" }) {
  const bars = [30, 75, 45, 90, 60, 100, 40, 80, 55, 95, 35, 70, 50, 85, 65, 40];

  return (
    <div className="editor-audio-wave" style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, height: 24, padding: "0 4px" }} aria-hidden="true">
      {bars.map((height, i) => (
        <span
          key={i}
          style={{
            width: 3,
            height: `${height}%`,
            background: accent,
            borderRadius: 2,
            opacity: 0.85,
            boxShadow: `0 0 6px ${accent}aa`,
            animation: `equalizerPulse 1.2s ease-in-out infinite alternate`,
            animationDelay: `${(i * 0.08) % 1.2}s`,
          }}
        />
      ))}
    </div>
  );
}
