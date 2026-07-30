"use client";
import { useMemo } from "react";

/**
 * Editor Video Showreel Player component.
 * Displays embedded video showreel with film monitor bezel & frame counter.
 *
 * Fixes:
 * - Correctly extracts YouTube video ID from all URL formats
 *   (embed, watch?v=, youtu.be, with/without query params)
 * - Uses useMemo so URL never sticks to a stale render
 */
export default function EditorVideoReel({ metadata = {} }) {
  const config = useMemo(() => {
    const defaults = {
      url: "",
      title: "Creative Showreel 2026",
      desc: "Selected edits from 8 national BTech fests, live production sets, and stage direction.",
    };

    if (typeof metadata === "string" && metadata.trim() !== "") {
      try {
        return { ...defaults, ...JSON.parse(metadata) };
      } catch (e) {
        return defaults;
      }
    } else if (typeof metadata === "object" && metadata !== null) {
      return { ...defaults, ...metadata };
    }
    return defaults;
  }, [metadata]);

  /**
   * Robustly extract a clean YouTube embed URL from any YouTube URL format.
   * Handles: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID,
   *          all with or without extra query params.
   */
  const videoEmbedUrl = useMemo(() => {
    const raw = (config.url || "").trim();
    if (!raw) return null;

    // Already an embed URL — strip any extra query params after the ID
    if (raw.includes("youtube.com/embed/")) {
      const embedPart = raw.split("youtube.com/embed/")[1];
      // Take only the video ID (before any & or ?)
      const videoId = embedPart.split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // youtu.be/ID
    if (raw.includes("youtu.be/")) {
      const afterSlash = raw.split("youtu.be/")[1];
      const videoId = afterSlash.split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // youtube.com/watch?v=ID
    if (raw.includes("youtube.com/watch")) {
      try {
        const url = new URL(raw);
        const videoId = url.searchParams.get("v");
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      } catch (e) {
        // fallback: manual parse
        const match = raw.match(/[?&]v=([^&]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    // Vimeo: vimeo.com/ID
    if (raw.includes("vimeo.com/")) {
      const parts = raw.split("vimeo.com/");
      const videoId = parts[1].split(/[?&/]/)[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    // Return as-is (already an embed or unknown)
    return raw;
  }, [config.url]);

  if (!videoEmbedUrl) return null;

  return (
    <section className="section wrap video-reel-section">
      <div className="section-head">
        <h3 className="section-head__title">Showreel &amp; Edit Reel</h3>
        <span className="section-head__num">/ FEATURED</span>
      </div>

      <div className="video-reel-card">
        <div className="video-reel-topbar">
          <span className="video-reel-tag">PLAYBACK MONITOR // 4K CUT</span>
          <span className="video-reel-title-text">{config.title}</span>
        </div>

        <div className="video-reel-frame">
          {/* key on videoEmbedUrl forces iframe to remount when URL changes */}
          <iframe
            key={videoEmbedUrl}
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
    </section>
  );
}
