"use client";

/**
 * Editor Video Showreel Player component.
 * Displays embedded video showreel with film monitor bezel & frame counter.
 */
export default function EditorVideoReel({ metadata = {} }) {
  let config = {
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Creative Showreel 2026",
    desc: "Selected edits from 8 national BTech fests, live production sets, and stage direction.",
  };

  if (typeof metadata === "string" && metadata.trim() !== "") {
    try {
      config = { ...config, ...JSON.parse(metadata) };
    } catch (e) {
      // fallback
    }
  } else if (typeof metadata === "object" && metadata !== null) {
    config = { ...config, ...metadata };
  }

  // Convert watch YouTube URL to embed URL if needed
  let videoEmbedUrl = config.url || "https://www.youtube.com/embed/dQw4w9WgXcQ";
  if (videoEmbedUrl.includes("youtube.com/watch?v=")) {
    videoEmbedUrl = videoEmbedUrl.replace("watch?v=", "embed/");
  } else if (videoEmbedUrl.includes("youtu.be/")) {
    const id = videoEmbedUrl.split("youtu.be/")[1];
    videoEmbedUrl = `https://www.youtube.com/embed/${id}`;
  }

  return (
    <section className="section wrap video-reel-section">
      <div className="section-head">
        <h3 className="section-head__title">Showreel & Edit Reel</h3>
        <span className="section-head__num">/ FEATURED</span>
      </div>

      <div className="video-reel-card">
        <div className="video-reel-monitor">
          <div className="video-reel-topbar">
            <span className="video-reel-tag">PLAYBACK MONITOR // 4K CUT</span>
            <span className="video-reel-title">{config.title}</span>
          </div>

          <div className="video-reel-frame">
            <iframe
              src={videoEmbedUrl}
              title={config.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video-reel-iframe"
            />
          </div>

          {config.desc && (
            <div className="video-reel-footer">
              <p className="video-reel-desc">{config.desc}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
